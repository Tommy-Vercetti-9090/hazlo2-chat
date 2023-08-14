export function isSessionCoinciding(sessions) {
  const n = sessions.length;

  for (let i = 0; i < n; i++) {
    const session1 = sessions[i];
    for (let j = i + 1; j < n; j++) {
      const session2 = sessions[j];
      if (
        session1.startTime === session1.endTime ||
        session2.startTime === session2.endTime
      ) {
        return true;
      }
      if (
        session1.startTime < session2.endTime &&
        session1.endTime > session2.startTime
      ) {
        return true; // Coinciding sessions found
      }
    }
  }

  return false; // No coinciding sessions found
}
