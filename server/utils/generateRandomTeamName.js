const adjectives = [
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Brave",
  "Swift",
  "Mighty",
];
const nouns = [
  "Lions",
  "Tigers",
  "Bears",
  "Wolves",
  "Eagles",
  "Falcons",
  "Dragons",
];
const suffixes = [
  "Team",
  "Squad",
  "Crew",
  "Group",
  "Force",
  "Alliance",
  "Guild",
];

const generateRandomTeamName = () => {
  const getRandomElement = (array) =>
    array[Math.floor(Math.random() * array.length)];

  const adjective = getRandomElement(adjectives);
  const noun = getRandomElement(nouns);
  const suffix = getRandomElement(suffixes);

  return `${adjective}${noun}${suffix}`;
};

module.exports = generateRandomTeamName;