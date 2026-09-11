-- SMS in the lead drawer (2026-09-11): templates gain a channel, inbound texts
-- gain a read marker so the CRM can badge unread replies.
alter table public.email_templates add column if not exists channel text not null default 'email';
alter table public.email_templates drop constraint if exists email_templates_channel_check;
alter table public.email_templates add constraint email_templates_channel_check check (channel in ('email','sms','voicemail'));
alter table public.sms_messages add column if not exists read_at timestamptz;
create index if not exists sms_messages_unread_idx on public.sms_messages (lead_id) where direction = 'inbound' and read_at is null;

-- Peter's first SMS + voicemail templates (2026-09-11). Merge fields:
-- {{first_name}} {{business_name}} {{rep_name}} {{demo_link}} {{claim_link}}.
insert into public.email_templates (code, name, part, category, subject, body, use_when, is_active, display_order, channel)
select v.code, v.name, 'sms', v.category, '', v.body, v.use_when, true, v.ord, v.channel
from (values
  ('S1', 'Missed you on the phone', 'Follow-up', E'Hi {{first_name}}, I phoned earlier but could not reach you.\nI know bringing back old clients is a challenge for {{business_name}}. Let us help you with that.\nPlease call back or text. {{rep_name}}, Stemfra', 'After a call they answered (or texted first) and you want to follow up. Only where the owner has agreed to texts.', 10, 'sms'),
  ('S2', 'Website built for you', 'Offer', E'Hi {{first_name}}, we want to help {{business_name}} get more customers and bring back the lost ones.\nWe have built a website for you since you do not have one. Take a look and let us chat further:\n{{demo_link}}', 'When they asked what this is about. Sends the demo site for their vertical.', 20, 'sms'),
  ('S3', 'Free booking website', 'Offer', E'We built this website to help {{business_name}} take client bookings online. Check it out, it is free:\n{{claim_link}}', 'When they want the link to claim their own site.', 30, 'sms'),
  ('V1', 'Voicemail: win back clients', 'Voicemail', E'Hi, this is {{rep_name}} from Stemfra. If you need new clients or want to win back your old ones, call me back on this number. Thanks.', 'Read this when the call goes to voicemail. Not a text.', 40, 'voicemail')
) as v(code, name, category, body, use_when, ord, channel)
where not exists (select 1 from public.email_templates e where e.code = v.code);
