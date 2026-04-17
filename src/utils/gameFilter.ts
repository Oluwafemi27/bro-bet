/**
 * Utility functions to filter games to only show live or upcoming games
 * Games older than 4 hours are considered finished and should not be shown
 */

const LIVE_WINDOW = 4 * 60 * 60 * 1000; // 4 hours after start = still "live"

/**
 * Check if a game/event should be displayed (live or upcoming)
 * @param timestamp - The game start time as ISO string or Date
 * @returns true if the game is live or upcoming, false if it's finished
 */
export function isGameLiveOrUpcoming(timestamp: string | Date | number): boolean {
  if (!timestamp) return false;

  let gameTime: number;
  if (typeof timestamp === 'string') {
    gameTime = new Date(timestamp).getTime();
  } else if (timestamp instanceof Date) {
    gameTime = timestamp.getTime();
  } else {
    gameTime = timestamp;
  }

  if (isNaN(gameTime)) return false;

  const now = Date.now();
  const timeSinceStart = now - gameTime;

  // Game is live if it's started but hasn't been running for more than LIVE_WINDOW
  if (timeSinceStart >= 0 && timeSinceStart < LIVE_WINDOW) {
    return true;
  }

  // Game is upcoming if it hasn't started yet
  if (timeSinceStart < 0) {
    return true;
  }

  return false;
}

/**
 * Filter games to only show live or upcoming games
 * @param games - Array of games with a timestamp property
 * @param timestampKey - The property name containing the game start time
 * @returns Filtered array of games
 */
export function filterGamesByLiveOrUpcoming<
  T extends Record<string, any>
>(games: T[], timestampKey: keyof T = 'commence_time' as keyof T): T[] {
  return games.filter(game => {
    const timestamp = game[timestampKey];
    return isGameLiveOrUpcoming(timestamp);
  });
}

/**
 * Get the hourly refetch interval for games (1 hour in milliseconds)
 */
export const GAMES_HOURLY_REFETCH_INTERVAL = 1000 * 60 * 60; // 1 hour
