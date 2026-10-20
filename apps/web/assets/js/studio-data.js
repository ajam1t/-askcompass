/* Sample procedures for Ask Compass Studio.
   These are illustrative examples, not real policy. Each procedure is a set
   of steps (nodes) joined by arrows (edges).

   Step types:
     action   - something to do (one arrow out)
     decision - a question (two or more labelled arrows out)
     note     - information to read (one arrow out)
     link     - hands off to another procedure, then continues (one arrow out)
     end      - the end of a path (no arrows out)

   Optional step fields: inputs (checklist before continuing), exception,
   source (the approved section the step comes from), linkTo (procedure id). */
window.STUDIO_SAMPLES = [
  {
    id: 'equipment-request', title: 'Request new equipment', folder: 'IT & Workplace', owner: 'IT Operations',
    summary: 'Request hardware, peripherals or software for work.',
    start: 'start',
    nodes: [
      { id: 'start', type: 'action', title: 'Start a request', body: 'Open a new equipment request in the service portal and choose the item category.', inputs: ['The item you need', 'Your business reason'], source: '§1.1 Starting a request' },
      { id: 'eligible', type: 'action', title: 'Check eligibility', body: 'Confirm you have passed your first 30 days and have not received the same item in the last 24 months.', inputs: ['Start date checked', 'No same item in 24 months'], source: '§1.2 Eligibility' },
      { id: 'approval-q', type: 'decision', title: 'Is manager approval required?', body: 'Approval is required when the item costs more than ₹1,00,000 or is not in the standard catalog.', source: '§2.1 Approval thresholds' },
      { id: 'approval', type: 'action', title: 'Get manager approval', body: 'Send the request to your manager for approval before you submit it.', exception: 'If your manager is away for more than two business days, route the approval to their delegate.', inputs: ['Approval received'], source: '§3.1 Manager approval' },
      { id: 'submit', type: 'action', title: 'Submit the request', body: 'Submit the request in the portal. IT Operations confirms the order and delivery date.', inputs: ['Request submitted'], source: '§4.1 Submission' },
      { id: 'done', type: 'end', title: 'Confirm delivery', body: 'When the item arrives, confirm receipt in the portal within five days.' }
    ],
    edges: [
      { from: 'start', to: 'eligible' }, { from: 'eligible', to: 'approval-q' },
      { from: 'approval-q', to: 'approval', label: 'Yes, over ₹1,00,000 or non-catalog' },
      { from: 'approval-q', to: 'submit', label: 'No, standard catalog item' },
      { from: 'approval', to: 'submit' }, { from: 'submit', to: 'done' }
    ]
  },
  {
    id: 'system-access', title: 'Grant access to a business system', folder: 'IT & Workplace', owner: 'IT Security',
    summary: 'Handle a request for access to an internal system, including identity checks.',
    start: 'receive',
    nodes: [
      { id: 'receive', type: 'action', title: 'Open the access request', body: 'Note the system, the access level requested and who is asking.', inputs: ['System and access level noted'] },
      { id: 'verify', type: 'link', title: 'Verify the requester’s identity', body: 'Follow the identity check procedure, then come back here.', linkTo: 'verify-identity' },
      { id: 'sensitive', type: 'decision', title: 'Does the system hold sensitive data?', body: 'Check the system register for its data classification.', source: '§2 Data classification' },
      { id: 'owner', type: 'action', title: 'Get data owner approval', body: 'Send the request to the named data owner for the system.', exception: 'If no data owner is listed, escalate to IT Security before granting anything.', inputs: ['Data owner approved'] },
      { id: 'grant', type: 'action', title: 'Grant the access', body: 'Grant the lowest access level that meets the need and record the change ticket.', inputs: ['Access granted', 'Ticket updated'] },
      { id: 'done', type: 'end', title: 'Tell the requester', body: 'Confirm access to the requester and close the ticket.' }
    ],
    edges: [
      { from: 'receive', to: 'verify' }, { from: 'verify', to: 'sensitive' },
      { from: 'sensitive', to: 'owner', label: 'Yes' }, { from: 'sensitive', to: 'grant', label: 'No' },
      { from: 'owner', to: 'grant' }, { from: 'grant', to: 'done' }
    ]
  },
  {
    id: 'verify-identity', title: 'Verify someone’s identity', folder: 'Security', owner: 'IT Security',
    summary: 'A short identity check used by other procedures before sensitive changes.',
    start: 'ask',
    nodes: [
      { id: 'ask', type: 'action', title: 'Ask for two identifiers', body: 'Ask for the employee ID and the registered phone number or email address.', inputs: ['Employee ID', 'Second identifier'] },
      { id: 'match', type: 'decision', title: 'Do both identifiers match the directory?', body: 'Compare both answers with the staff directory.' },
      { id: 'ok', type: 'end', title: 'Identity confirmed', body: 'Continue with the procedure you came from.' },
      { id: 'callback', type: 'action', title: 'Call back on the registered number', body: 'End the conversation and call back on the phone number in the directory.', exception: 'Never use a number the person gives you during the request.' },
      { id: 'stop', type: 'end', title: 'Stop and report', body: 'Do not make the change. Report the attempt to IT Security.' }
    ],
    edges: [
      { from: 'ask', to: 'match' }, { from: 'match', to: 'ok', label: 'Yes' }, { from: 'match', to: 'callback', label: 'No' },
      { from: 'callback', to: 'stop' }
    ]
  },
  {
    id: 'customer-refund', title: 'Handle a refund request', folder: 'Customer Support', owner: 'Support Operations',
    summary: 'Decide whether a refund can be issued and how to handle requests outside policy.',
    start: 'find-order',
    nodes: [
      { id: 'find-order', type: 'action', title: 'Find the order', body: 'Look up the order using the order number or the customer’s email address.', inputs: ['Order found'] },
      { id: 'window', type: 'decision', title: 'How long ago was the order delivered?', body: 'Use the delivery date, not the order date.', source: 'Refund policy §1' },
      { id: 'condition', type: 'decision', title: 'Is the item unused and in its original packaging?', body: 'Ask the customer to confirm, or check the return photos.' },
      { id: 'refund', type: 'action', title: 'Issue the refund', body: 'Refund to the original payment method and send the confirmation email.', inputs: ['Refund issued', 'Confirmation sent'] },
      { id: 'goodwill', type: 'note', title: 'Outside the standard window', body: 'Requests after 30 days need a team lead decision. Collect the reason before escalating.' },
      { id: 'escalate', type: 'end', title: 'Escalate to a team lead', body: 'Assign the case to the team lead queue with the customer’s reason.' },
      { id: 'decline', type: 'end', title: 'Explain the policy and offer repair', body: 'Explain why a refund is not possible and offer the repair or exchange options.' },
      { id: 'done', type: 'end', title: 'Close the case', body: 'Add a case note and close the case.' }
    ],
    edges: [
      { from: 'find-order', to: 'window' },
      { from: 'window', to: 'condition', label: 'Within 30 days' }, { from: 'window', to: 'goodwill', label: 'More than 30 days' },
      { from: 'condition', to: 'refund', label: 'Yes' }, { from: 'condition', to: 'decline', label: 'No' },
      { from: 'refund', to: 'done' }, { from: 'goodwill', to: 'escalate' }
    ]
  },
  {
    id: 'onboarding-week-one', title: 'Prepare a new starter’s first week', folder: 'People & HR', owner: 'People Team',
    summary: 'Everything a hiring manager needs to arrange before and during week one.',
    start: 'confirm',
    nodes: [
      { id: 'confirm', type: 'action', title: 'Confirm start date and role', body: 'Check the signed offer for the start date, role and team.', inputs: ['Start date confirmed'] },
      { id: 'contract', type: 'decision', title: 'Is the signed contract on file?', body: 'Check the HR system for the signed contract.' },
      { id: 'hold', type: 'end', title: 'Pause and contact HR', body: 'Do not book accounts or equipment until HR confirms the contract.' },
      { id: 'where', type: 'decision', title: 'Will they work remotely or on site?', body: 'This decides how equipment is delivered.' },
      { id: 'ship', type: 'link', title: 'Order and ship equipment', body: 'Use the equipment request procedure, then come back here.', linkTo: 'equipment-request' },
      { id: 'desk', type: 'action', title: 'Reserve a desk and building pass', body: 'Book a desk near the team and request a building pass.', inputs: ['Desk booked', 'Pass requested'] },
      { id: 'plan', type: 'action', title: 'Share the first-week plan', body: 'Send the starter their first-week schedule and who to contact on day one.', inputs: ['Plan sent'] },
      { id: 'done', type: 'end', title: 'Ready for day one', body: 'The starter has what they need for their first week.' }
    ],
    edges: [
      { from: 'confirm', to: 'contract' }, { from: 'contract', to: 'where', label: 'Yes' }, { from: 'contract', to: 'hold', label: 'No' },
      { from: 'where', to: 'ship', label: 'Remote' }, { from: 'where', to: 'desk', label: 'On site' },
      { from: 'ship', to: 'plan' }, { from: 'desk', to: 'plan' }, { from: 'plan', to: 'done' }
    ]
  }
];
