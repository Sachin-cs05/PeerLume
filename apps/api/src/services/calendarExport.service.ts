import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@peerlume/shared';

function formatIcsDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export async function generateSessionIcs(userId: string, sessionId: string): Promise<{ ics: string; filename: string }> {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: {
      organizer: { select: { fullName: true, email: true } },
      participants: {
        include: { user: { select: { fullName: true, email: true } } },
      },
    },
  });

  if (!session) {
    throw new AppError('Learning session not found', HTTP_STATUS.NOT_FOUND);
  }

  const isAuthorized =
    session.organizerId === userId ||
    session.participants.some((p) => p.userId === userId && p.status === 'ACCEPTED');

  if (!isAuthorized) {
    throw new AppError('Unauthorized: You can only export sessions you are part of', HTTP_STATUS.FORBIDDEN);
  }

  const nowStr = formatIcsDate(new Date());
  const startStr = formatIcsDate(new Date(session.startTime));
  const endStr = formatIcsDate(new Date(session.endTime));

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PeerLearn//PeerLearn Learning Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:peerlume-session-${session.id}@peerlume.com`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${escapeIcsText(session.title)}`,
    `DESCRIPTION:${escapeIcsText(
      `Topic: ${session.topic}\\n${session.description || ''}\\nOrganized by ${session.organizer.fullName} on PeerLearn`
    )}`,
    session.location ? `LOCATION:${escapeIcsText(session.location)}` : session.meetingUrl ? `LOCATION:${escapeIcsText(session.meetingUrl)}` : 'LOCATION:PeerLearn Virtual Study Room',
    `ORGANIZER;CN=${escapeIcsText(session.organizer.fullName)}:mailto:${session.organizer.email}`,
    `STATUS:${session.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const safeTitle = session.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  return {
    ics,
    filename: `peerlume-session-${safeTitle || session.id}.ics`,
  };
}

export async function generateUserCalendarIcs(userId: string): Promise<{ ics: string; filename: string }> {
  const sessions = await prisma.learningSession.findMany({
    where: {
      OR: [{ organizerId: userId }, { participants: { some: { userId, status: 'ACCEPTED' } } }],
      status: { notIn: ['CANCELLED', 'DECLINED'] },
    },
    orderBy: { startTime: 'asc' },
    include: {
      organizer: { select: { fullName: true, email: true } },
    },
  });

  const nowStr = formatIcsDate(new Date());

  const eventLines: string[] = [];
  for (const session of sessions) {
    const startStr = formatIcsDate(new Date(session.startTime));
    const endStr = formatIcsDate(new Date(session.endTime));

    eventLines.push(
      'BEGIN:VEVENT',
      `UID:peerlume-session-${session.id}@peerlume.com`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${escapeIcsText(session.title)}`,
      `DESCRIPTION:${escapeIcsText(`Topic: ${session.topic}\\n${session.description || ''}`)}`,
      session.location ? `LOCATION:${escapeIcsText(session.location)}` : 'LOCATION:PeerLearn Study Room',
      `ORGANIZER;CN=${escapeIcsText(session.organizer.fullName)}:mailto:${session.organizer.email}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PeerLearn//PeerLearn Learning Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:PeerLearn Study Calendar',
    ...eventLines,
    'END:VCALENDAR',
  ].join('\r\n');

  return {
    ics,
    filename: 'peerlume-calendar.ics',
  };
}
