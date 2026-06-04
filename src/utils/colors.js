export const LANG_COLORS = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Dart: '#00B4AB',
  Java: '#b07219',
  'C#': '#178600',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  PowerShell: '#012456',
  Kotlin: '#F18E33',
  Swift: '#ffac45',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  _default: '#63b3ed',
}

export const TOPIC_COLORS = {
  fastapi: '#009688',
  django: '#092E20',
  spring: '#6DB33F',
  'spring-boot': '#6DB33F',
  dotnet: '#512BD4',
  flutter: '#02569B',
  react: '#61DAFB',
  angular: '#DD0031',
  nextjs: '#ffffff',
  docker: '#2496ED',
  postgresql: '#336791',
  redis: '#DC382D',
  rabbitmq: '#FF6600',
  elasticsearch: '#005571',
  kubernetes: '#326CE5',
  solr: '#D9411E',
  wordpress: '#21759B',
  dspace: '#2D7A9F',
  keycloak: '#4D4D4D',
  alembic: '#6BA3BE',
  sqlalchemy: '#D71F00',
}

export function getLangColor(lang) {
  return LANG_COLORS[lang] ?? LANG_COLORS._default
}

export function getTopicColor(topic) {
  if (TOPIC_COLORS[topic]) return TOPIC_COLORS[topic]
  // deterministic color from string
  const palette = ['#63b3ed','#9f7aea','#68d391','#f6ad55','#fc8181','#76e4f7','#b794f4','#fbd38d']
  let h = 0
  for (let i = 0; i < topic.length; i++) h = (h * 31 + topic.charCodeAt(i)) % palette.length
  return palette[h]
}
