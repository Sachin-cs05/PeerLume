import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { createNotification } from './notification.service.js';

const REMINDER_INTERVALS_MINUTES = [60, 15]; // Reminders at 60 mins and 15 mins before start

let reminderTimer: NodeJS.Timeout | null = null;

export async function checkAndDispatchReminders(): Promise<{ dispatchedCount: number }> {
  const now = new Date();
  let dispatchedCount = 0;

  for (const minutesBefore of REMINDER_INTERVALS_MINUTES) {
    const windowStart = new Date(now.getTime() + (minutesBefore - 5) * 60 * 1000);
    const windowEnd = new Date(now.getTime() + (minutesBefore + 5) * 60 * 1000);

    // Find accepted upcoming sessions occurring around this reminder window
    const upcomingSessions = await prisma.learningSession.findMany({
      where: {
        status: 'ACCEPTED',
        startTime: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        participants: {
          where: { status: 'ACCEPTED' },
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    for (const session of upcomingSessions) {
      for (const participant of session.participants) {
        try {
          // Idempotency: Attempt to record the reminder in DB
          const alreadySent = await prisma.sessionReminder.findUnique({
            where: {
              sessionId_userId_minutesBefore: {
                sessionId: session.id,
                userId: participant.userId,
                minutesBefore,
              },
            },
          });

          if (alreadySent) {
            continue;
          }

          // Create reminder record
          await prisma.sessionReminder.create({
            data: {
              sessionId: session.id,
              userId: participant.userId,
              minutesBefore,
            },
          });

          // Dispatch persistent notification
          await createNotification({
            userId: participant.userId,
            actorId: session.organizerId,
            type: 'SESSION_REMINDER',
            title: `Study Session in ${minutesBefore} minutes`,
            body: `"${session.title}" (${session.topic}) starts in ${minutesBefore} minutes. Get ready!`,
            data: {
              sessionId: session.id,
              startTime: session.startTime.toISOString(),
              mode: session.mode,
            },
          });

          dispatchedCount++;
        } catch (err: any) {
          logger.error(
            `Failed to send session reminder to user ${participant.userId} for session ${session.id}:`,
            err.message
          );
        }
      }
    }
  }

  return { dispatchedCount };
}

export function startReminderScheduler(pollIntervalMs = 60000): void {
  if (reminderTimer) return;

  logger.info('⏰ Session Reminder Scheduler started (checking every 60s)');
  
  // Run initial check
  checkAndDispatchReminders().catch((err) => {
    logger.error('Error during initial session reminder dispatch:', err);
  });

  reminderTimer = setInterval(() => {
    checkAndDispatchReminders().catch((err) => {
      logger.error('Error during scheduled session reminder dispatch:', err);
    });
  }, pollIntervalMs);
}

export function stopReminderScheduler(): void {
  if (reminderTimer) {
    clearInterval(reminderTimer);
    reminderTimer = null;
    logger.info('⏰ Session Reminder Scheduler stopped');
  }
}
