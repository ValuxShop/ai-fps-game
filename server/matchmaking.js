// server/matchmaking.js

const queue = [];
const activeMatches = {};

function joinQueue(player) {
  if (queue.find(p => p.id === player.id)) return;
  queue.push(player);
}

function leaveQueue(playerId) {
  const index = queue.findIndex(p => p.id === playerId);
  if (index !== -1) queue.splice(index, 1);
}

function tryCreateMatch() {
  if (queue.length < 2) return null;

  // Simple matchmaking: first two players
  const p1 = queue.shift();
  const p2 = queue.shift();

  const matchId = `match_${Date.now()}`;

  activeMatches[matchId] = {
    id: matchId,
    players: [p1.id, p2.id],
    started: false
  };

  return activeMatches[matchId];
}

function endMatch(matchId, winnerId, players) {
  const match = activeMatches[matchId];
  if (!match) return;

  const loserId = match.players.find(id => id !== winnerId);

  // Basic ELO
  players[winnerId].rank += 25;
  players[loserId].rank -= 25;

  delete activeMatches[matchId]()
