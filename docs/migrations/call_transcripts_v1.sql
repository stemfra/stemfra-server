-- call_transcripts_v1 (2026-09-11, Peter: "look at the call transcript from my
-- call with this client and learn from it"). Rep calls were recorded but never
-- transcribed. The server now transcribes a finished recording (OpenAI) and
-- summarises it (questions the prospect asked, objections, next steps), so the
-- team learns from every conversation and the drawer can show it.
alter table public.calls add column if not exists transcript text;
alter table public.calls add column if not exists transcript_summary jsonb;
alter table public.calls add column if not exists transcribed_at timestamptz;
alter table public.calls add column if not exists transcript_error text;
