// One ring, three things a tap can do. Pay is this site; ID and Events are the
// brand's sister products (reeng.id, reeng.events). Sample people/events are fictional.

export const modes = [
  {
    id: 'pay',
    name: 'Pay',
    product: 'Reeng',
    body: 'Spend stablecoins at any contactless terminal.',
    href: null,
    glow: '#B57BFF', // 3D tint
    text: '#9730F6', // readable on paper
  },
  {
    id: 'id',
    name: 'ID',
    product: 'Reeng ID',
    body: 'Tap a phone to share your profile. They don’t need an app.',
    href: 'https://www.reeng.id/',
    glow: '#6EA8FF',
    text: '#2F5FD0',
  },
  {
    id: 'events',
    name: 'Events',
    product: 'Reeng Events',
    body: 'Check in at the door with a tap. No tickets, no queue.',
    href: 'https://www.reeng.events/',
    glow: '#FFB547',
    text: '#A65F00',
  },
] as const

export type Mode = (typeof modes)[number]
