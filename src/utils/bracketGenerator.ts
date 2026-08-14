import { BracketMatch, BracketTeam, TournamentBracket, Participant, Competition } from '../types';

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateTeamsFromParticipants(
  participants: Participant[],
  format: '2v2' | '1v1'
): BracketTeam[] {
  const shuffled = shuffleArray(participants);
  const teams: BracketTeam[] = [];

  if (format === '2v2') {
    let teamCounter = 1;
    for (let i = 0; i < shuffled.length; i += 2) {
      const p1 = shuffled[i];
      const p2 = shuffled[i + 1];

      if (p1 && p2) {
        teams.push({
          id: `team-${teamCounter}`,
          name: `Tim ${teamCounter}: ${p1.name} & ${p2.name}`,
          members: [p1.name, p2.name],
          houseNos: [p1.houseNo || '-', p2.houseNo || '-'],
        });
      } else if (p1) {
        teams.push({
          id: `team-${teamCounter}`,
          name: `Tim ${teamCounter}: ${p1.name} (Solo)`,
          members: [p1.name],
          houseNos: [p1.houseNo || '-'],
        });
      }
      teamCounter++;
    }
  } else {
    shuffled.forEach((p, idx) => {
      teams.push({
        id: `team-${idx + 1}`,
        name: p.name,
        members: [p.name],
        houseNos: [p.houseNo || '-'],
      });
    });
  }

  return teams;
}

export function getRoundName(roundIndex: number, totalRounds: number): string {
  const roundsFromFinal = totalRounds - 1 - roundIndex;
  if (roundsFromFinal === 0) return 'Babak Final';
  if (roundsFromFinal === 1) return 'Babak Semifinal';
  if (roundsFromFinal === 2) return 'Perempat Final (8 Besar)';
  if (roundsFromFinal === 3) return 'Babak 16 Besar';
  if (roundsFromFinal === 4) return 'Babak 32 Besar';
  return `Babak Penyisihan (Ronde ${roundIndex + 1})`;
}

export function generateKnockoutBracket(
  competition: Competition,
  participants: Participant[],
  format: '2v2' | '1v1' = '2v2'
): TournamentBracket {
  const teams = generateTeamsFromParticipants(participants, format);
  const numTeams = teams.length;

  // Determine bracket size (next power of 2, min 2)
  let bracketSize = 2;
  while (bracketSize < numTeams) {
    bracketSize *= 2;
  }
  if (bracketSize < 2) bracketSize = 2;

  const totalRounds = Math.max(1, Math.round(Math.log2(bracketSize)));
  const matches: BracketMatch[] = [];

  let tableCounter = 1;

  // 1. Create empty match tree for each round
  for (let r = 0; r < totalRounds; r++) {
    const numMatchesInRound = bracketSize / Math.pow(2, r + 1);
    const roundName = getRoundName(r, totalRounds);

    for (let m = 0; m < numMatchesInRound; m++) {
      const matchId = `match-r${r}-m${m}`;
      const isFinal = r === totalRounds - 1;
      const isSemifinal = r === totalRounds - 2;

      let nextMatchId: string | undefined = undefined;
      let nextMatchSlot: (1 | 2) | undefined = undefined;

      if (!isFinal) {
        nextMatchId = `match-r${r + 1}-m${Math.floor(m / 2)}`;
        nextMatchSlot = (m % 2 === 0 ? 1 : 2) as 1 | 2;
      }

      let loserNextMatchId: string | undefined = undefined;
      let loserNextMatchSlot: (1 | 2) | undefined = undefined;

      if (isSemifinal && totalRounds >= 2) {
        loserNextMatchId = 'match-3rd-place';
        loserNextMatchSlot = (m % 2 === 0 ? 1 : 2) as 1 | 2;
      }

      matches.push({
        id: matchId,
        roundIndex: r,
        roundName,
        matchNumber: matches.length + 1,
        tableNumber: r === 0 ? tableCounter++ : undefined,
        team1: null,
        team2: null,
        score1: '',
        score2: '',
        winnerTeamId: null,
        nextMatchId,
        nextMatchSlot,
        loserNextMatchId,
        loserNextMatchSlot,
      });
    }
  }

  // 2. Add 3rd Place Match if there is a semifinal
  if (totalRounds >= 2) {
    matches.push({
      id: 'match-3rd-place',
      roundIndex: totalRounds - 1,
      roundName: 'Perebutan Juara 3',
      matchNumber: matches.length + 1,
      team1: null,
      team2: null,
      score1: '',
      score2: '',
      winnerTeamId: null,
      isThirdPlaceMatch: true,
    });
  }

  // 3. Populate Round 0 matches with teams
  const round0Matches = matches.filter((m) => m.roundIndex === 0 && !m.isThirdPlaceMatch);

  for (let m = 0; m < round0Matches.length; m++) {
    const match = round0Matches[m];
    const team1 = teams[2 * m] || null;
    const team2 = teams[2 * m + 1] || null;

    match.team1 = team1;
    match.team2 = team2;

    // Handle BYE automatically if team2 is null but team1 exists
    if (team1 && !team2) {
      match.winnerTeamId = team1.id;
      match.notes = 'Lolos otomatis (BYE)';

      // Advance team1 to next match immediately
      if (match.nextMatchId) {
        const nextMatch = matches.find((n) => n.id === match.nextMatchId);
        if (nextMatch) {
          if (match.nextMatchSlot === 1) nextMatch.team1 = team1;
          if (match.nextMatchSlot === 2) nextMatch.team2 = team1;
        }
      }
    }
  }

  const now = new Date().toISOString();

  return {
    id: `bracket-${competition.id}-${Date.now()}`,
    competitionId: competition.id,
    competitionName: competition.name,
    format,
    totalRounds,
    createdAt: now,
    updatedAt: now,
    teams,
    matches,
  };
}

export function updateMatchResult(
  bracket: TournamentBracket,
  matchId: string,
  winnerTeamId: string | null,
  score1?: number | string,
  score2?: number | string,
  notes?: string
): TournamentBracket {
  const newMatches = bracket.matches.map((m) => ({ ...m }));
  const matchIndex = newMatches.findIndex((m) => m.id === matchId);
  if (matchIndex === -1) return bracket;

  const match = newMatches[matchIndex];
  const oldWinnerId = match.winnerTeamId;

  match.winnerTeamId = winnerTeamId;
  if (score1 !== undefined) match.score1 = score1;
  if (score2 !== undefined) match.score2 = score2;
  if (notes !== undefined) match.notes = notes;

  const winnerTeam = winnerTeamId
    ? match.team1?.id === winnerTeamId
      ? match.team1
      : match.team2?.id === winnerTeamId
      ? match.team2
      : null
    : null;

  const loserTeam = winnerTeamId
    ? match.team1?.id === winnerTeamId
      ? match.team2
      : match.team1
    : null;

  // Propagate winner to next match
  if (match.nextMatchId) {
    const nextMatch = newMatches.find((n) => n.id === match.nextMatchId);
    if (nextMatch) {
      if (match.nextMatchSlot === 1) {
        nextMatch.team1 = winnerTeam;
      } else if (match.nextMatchSlot === 2) {
        nextMatch.team2 = winnerTeam;
      }
      // If winner changed/cleared, clear downstream winner in next match as well
      if (oldWinnerId && oldWinnerId !== winnerTeamId && nextMatch.winnerTeamId === oldWinnerId) {
        nextMatch.winnerTeamId = null;
      }
    }
  }

  // Propagate loser to 3rd place match if applicable
  if (match.loserNextMatchId) {
    const thirdMatch = newMatches.find((n) => n.id === match.loserNextMatchId);
    if (thirdMatch) {
      if (match.loserNextMatchSlot === 1) {
        thirdMatch.team1 = loserTeam;
      } else if (match.loserNextMatchSlot === 2) {
        thirdMatch.team2 = loserTeam;
      }
      if (thirdMatch.winnerTeamId && (thirdMatch.winnerTeamId === match.team1?.id || thirdMatch.winnerTeamId === match.team2?.id)) {
        thirdMatch.winnerTeamId = null;
      }
    }
  }

  // Determine Champion & Runner-up if this was Final
  const finalMatch = newMatches.find(
    (m) => m.roundIndex === bracket.totalRounds - 1 && !m.isThirdPlaceMatch
  );
  let championTeamId: string | undefined = undefined;
  let runnerUpTeamId: string | undefined = undefined;

  if (finalMatch && finalMatch.winnerTeamId) {
    championTeamId = finalMatch.winnerTeamId;
    runnerUpTeamId =
      finalMatch.team1?.id === championTeamId
        ? finalMatch.team2?.id
        : finalMatch.team1?.id;
  }

  // Determine 3rd place
  const thirdMatch = newMatches.find((m) => m.isThirdPlaceMatch);
  let thirdPlaceTeamId: string | undefined = undefined;
  if (thirdMatch && thirdMatch.winnerTeamId) {
    thirdPlaceTeamId = thirdMatch.winnerTeamId;
  }

  return {
    ...bracket,
    matches: newMatches,
    championTeamId,
    runnerUpTeamId,
    thirdPlaceTeamId,
    updatedAt: new Date().toISOString(),
  };
}
