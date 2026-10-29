// The Privacy Policy and Terms of Service, migrated word for word from reeng.xyz
// (/privacy-policy and /terms-of-service, October 2026). The live pages show today's date as
// "Last updated", so no real revision date came across: add one here when the client confirms it.

/** A block of a legal section: a paragraph, a bulleted list, a small sub-heading, or an email line. */
export type Block = string | { list: string[] } | { sub: string } | { email: string }
export type LegalSection = { title: string; blocks: Block[] }

export const SUPPORT_EMAIL = 'reeng@reeng.xyz'

export const privacy: LegalSection[] = [
  {
    title: 'Overview',
    blocks: ['This Privacy Policy explains how Reeng Wallet collects, uses, stores, and protects your information.'],
  },
  {
    title: 'Information We Collect',
    blocks: [
      { sub: 'a. Information You Provide' },
      { list: ['Email address', 'Support communications'] },
      { sub: 'b. Automatically Collected Information' },
      { list: ['Device type, OS version', 'App usage and performance data', 'Anonymous analytics data'] },
      { sub: 'c. Blockchain Data' },
      { list: ['Public wallet addresses', 'Transaction hashes and timestamps'] },
      'Reeng does not collect private keys, recovery phrases, or PINs.',
    ],
  },
  {
    title: 'How We Use Information',
    blocks: [
      'We use collected information to:',
      {
        list: [
          'Provide and improve the Services',
          'Ensure security and prevent abuse',
          'Communicate updates and support responses',
          'Comply with legal obligations',
        ],
      },
    ],
  },
  {
    title: 'Data Sharing',
    blocks: [
      'We do not sell user data. Information may be shared only:',
      { list: ['With service providers (analytics, infrastructure)', 'When required by law', 'To protect Reeng, users, or the public'] },
    ],
  },
  {
    title: 'Data Storage and Security',
    blocks: [
      'We implement reasonable administrative, technical, and organizational safeguards to protect user information. However, no system is completely secure.',
    ],
  },
  {
    title: 'Data Retention',
    blocks: [
      'We retain personal data only as long as necessary to fulfill the purposes described in this Policy or to comply with legal requirements.',
    ],
  },
  {
    title: 'International Transfers',
    blocks: ['Your data may be processed or stored outside your country of residence. We take steps to ensure adequate data protection.'],
  },
  {
    title: 'Your Rights',
    blocks: [
      'Depending on your jurisdiction, you may have the right to:',
      { list: ['Access your data', 'Request correction or deletion', 'Withdraw consent'] },
      'Requests can be made via our support contact.',
    ],
  },
  {
    title: 'Cookies and Tracking',
    blocks: ['Reeng may use cookies or similar technologies on its website for functionality and analytics.'],
  },
  {
    title: "Children's Privacy",
    blocks: ['Reeng Wallet is not intended for children under 18. We do not knowingly collect data from minors.'],
  },
  {
    title: 'Changes to Privacy Policy',
    blocks: ['We may update this Privacy Policy periodically. Changes will be posted within the app or on our website.'],
  },
  {
    title: 'Contact Us',
    blocks: ['For questions about these Terms or Privacy Policy, contact:', 'Reeng Wallet Support', { email: SUPPORT_EMAIL }],
  },
]

export const terms: LegalSection[] = [
  {
    title: 'Introduction',
    blocks: [
      'Welcome to Reeng Wallet ("Reeng", "we", "our", or "us"). Reeng Wallet is a wearable and mobile-based stablecoin wallet that enables users to store, send, receive, and interact with digital assets and payment services.',
      'By accessing or using the Reeng Wallet mobile application, wearable devices, websites, APIs, or related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Services.',
    ],
  },
  {
    title: 'Eligibility',
    blocks: [
      'You must be at least 18 years old, or the legal age in your jurisdiction, to use Reeng Wallet. By using the Services, you represent that you meet this requirement.',
    ],
  },
  {
    title: 'Account Registration',
    blocks: [{ list: ['You are responsible for maintaining the security of your device.', 'Reeng does not store or have access to your private keys.'] }],
  },
  {
    title: 'Supported Assets and Networks',
    blocks: [
      'Reeng may support specific stablecoins, blockchains, and networks. Supported assets may change over time without notice. You are responsible for ensuring compatibility before initiating transactions.',
    ],
  },
  {
    title: 'Transactions',
    blocks: [
      {
        list: [
          'Blockchain transactions are irreversible.',
          'Reeng is not responsible for failed, delayed, or incorrect transactions caused by user error, network congestion, smart contract issues, or third-party services.',
          'Network and gas fees may apply and are not controlled by Reeng.',
        ],
      },
    ],
  },
  {
    title: 'Wearable Devices and NFC Usage',
    blocks: [
      'Reeng wearables may use NFC or similar technologies. You acknowledge that:',
      {
        list: [
          'Physical loss or unauthorized access to a wearable may result in loss of access to the wallet.',
          'You are responsible for safeguarding your wearable device.',
        ],
      },
    ],
  },
  {
    title: 'Prohibited Activities',
    blocks: [
      'You agree not to use Reeng Wallet for:',
      {
        list: [
          'Illegal activities, fraud, money laundering, or terrorist financing',
          'Circumventing sanctions or regulations',
          'Exploiting, reverse engineering, or attacking the Services',
        ],
      },
      'Reeng reserves the right to restrict or suspend access where misuse is suspected.',
    ],
  },
  {
    title: 'No Financial Advice',
    blocks: ['Reeng does not provide financial, investment, tax, or legal advice. All decisions made using the Services are at your own risk.'],
  },
  {
    title: 'Third-Party Services',
    blocks: [
      'The Services may integrate third-party platforms (e.g., blockchains, payment processors). Reeng is not responsible for third-party failures, policies, or actions.',
    ],
  },
  {
    title: 'Service Availability',
    blocks: ['Reeng may modify, suspend, or discontinue any part of the Services at any time without liability.'],
  },
  {
    title: 'Limitation of Liability',
    blocks: [
      'To the maximum extent permitted by law, Reeng shall not be liable for:',
      { list: ['Loss of digital assets', 'Loss of profits or data', 'Security breaches beyond our reasonable control'] },
    ],
  },
  {
    title: 'Indemnification',
    blocks: ['You agree to indemnify and hold harmless Reeng from claims arising from your misuse of the Services or violation of these Terms.'],
  },
  {
    title: 'Termination',
    blocks: ['Reeng may suspend or terminate your access at its discretion if you violate these Terms or applicable laws.'],
  },
  {
    title: 'Governing Law',
    blocks: [
      'These Terms shall be governed by and construed in accordance with applicable laws of the jurisdiction in which Reeng operates, without regard to conflict of law principles.',
    ],
  },
  {
    title: 'Changes to Terms',
    blocks: ['We may update these Terms from time to time. Continued use of the Services constitutes acceptance of the updated Terms.'],
  },
]
