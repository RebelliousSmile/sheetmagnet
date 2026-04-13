<script lang="ts">
import Nav from '$lib/components/Nav.svelte';
import { lang } from '$lib/stores/lang';
import { env } from '$env/dynamic/public';

const CONTACT_ENDPOINT =
  'https://sheetmagnet-production.up.railway.app/contact';
const CONTACT_TOKEN = env.PUBLIC_CONTACT_TOKEN ?? '';

type Subject = 'feature' | 'system' | 'partnership' | 'other';
type Step = 'subject' | 'details' | 'review' | 'done' | 'error';

let step = $state<Step>('subject');
let subject = $state<Subject | null>(null);
let name = $state('');
let email = $state('');
let message = $state('');
let honeypot = $state(''); // must stay empty
let isSubmitting = $state(false);

// Validation errors
let errors = $state<{ name?: string; email?: string; message?: string }>({});

const subjects: { id: Subject; label_fr: string; label_en: string }[] = [
  {
    id: 'feature',
    label_fr: 'Demande de fonctionnalité',
    label_en: 'Feature request',
  },
  {
    id: 'system',
    label_fr: 'Demander un système de jeu',
    label_en: 'Request a game system',
  },
  {
    id: 'partnership',
    label_fr: 'Question légale',
    label_en: 'Legal question',
  },
  { id: 'other', label_fr: 'Autre', label_en: 'Other' },
];

const t = $derived(
  $lang === 'fr'
    ? {
        title: 'Contact',
        subtitle: 'Sélectionnez le sujet de votre message.',
        formTitle: 'Poser une question',
        subjectTitle: 'Quel est le sujet ?',
        next: 'Suivant',
        back: '← Retour',
        fieldName: 'Votre nom',
        fieldEmail: 'Votre adresse email',
        fieldMessage: 'Votre message',
        fieldMessageHint: '20 caractères minimum, 2000 maximum.',
        reviewTitle: 'Vérifiez votre message',
        reviewSubject: 'Sujet',
        reviewName: 'Nom',
        reviewEmail: 'Email',
        reviewMessage: 'Message',
        send: 'Envoyer',
        sending: 'Envoi…',
        edit: 'Modifier',
        doneTitle: 'Message envoyé',
        doneDesc:
          'Merci, nous avons bien reçu votre message et vous répondrons dans les meilleurs délais.',
        errorTitle: "Erreur d'envoi",
        errorDesc:
          'Une erreur est survenue. Veuillez réessayer ou réouvrir un ticket sur GitHub.',
        retry: 'Réessayer',
        githubIssue: 'Ouvrir un ticket GitHub',
        errName: 'Veuillez indiquer votre nom (2 caractères minimum).',
        errEmail: 'Adresse email invalide.',
        errMessage: 'Le message doit contenir au moins 20 caractères.',
        errMessageLong: 'Le message ne peut pas dépasser 2000 caractères.',
        bugEncartTitle: 'Signaler un bug via GitHub',
        bugEncartDesc:
          "GitHub est le meilleur endroit pour signaler un bug : ça permet de suivre l'avancement, de joindre des captures d'écran et de recevoir une notification quand c'est corrigé. Consultez CONTRIBUTING.md pour savoir quelles informations inclure.",
        bugGithubIssues: 'Ouvrir un ticket GitHub',
        bugContributing: 'Lire CONTRIBUTING.md',
      }
    : {
        title: 'Contact',
        subtitle: 'Select the subject of your message.',
        formTitle: 'Ask a question',
        subjectTitle: 'What is this about?',
        next: 'Next',
        back: '← Back',
        fieldName: 'Your name',
        fieldEmail: 'Your email address',
        fieldMessage: 'Your message',
        fieldMessageHint: 'At least 20 characters, max 2000.',
        reviewTitle: 'Review your message',
        reviewSubject: 'Subject',
        reviewName: 'Name',
        reviewEmail: 'Email',
        reviewMessage: 'Message',
        send: 'Send',
        sending: 'Sending…',
        edit: 'Edit',
        doneTitle: 'Message sent',
        doneDesc:
          'Thank you, we have received your message and will get back to you as soon as possible.',
        errorTitle: 'Send error',
        errorDesc:
          'Something went wrong. Please try again or open a GitHub issue instead.',
        retry: 'Try again',
        githubIssue: 'Open a GitHub issue',
        errName: 'Please enter your name (at least 2 characters).',
        errEmail: 'Invalid email address.',
        errMessage: 'Message must be at least 20 characters.',
        errMessageLong: 'Message cannot exceed 2000 characters.',
        bugEncartTitle: 'Report a bug via GitHub',
        bugEncartDesc:
          "GitHub is the best place to report a bug: it lets you track progress, attach screenshots, and get notified when it's fixed. Check CONTRIBUTING.md for what information to include.",
        bugGithubIssues: 'Open a GitHub issue',
        bugContributing: 'Read CONTRIBUTING.md',
      },
);

function getSubjectLabel(id: Subject): string {
  const s = subjects.find((s) => s.id === id);
  if (!s) return id;
  return $lang === 'fr' ? s.label_fr : s.label_en;
}

/** Strip HTML tags and control characters */
function sanitize(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}\p{S}\n]/gu, '')
    .trim();
}

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function validateDetails(): boolean {
  const e: typeof errors = {};
  const cleanName = sanitize(name);
  const cleanEmail = email.trim();
  const cleanMsg = sanitize(message);

  if (cleanName.length < 2) e.name = t.errName;
  if (!validateEmail(cleanEmail)) e.email = t.errEmail;
  if (cleanMsg.length < 20) e.message = t.errMessage;
  else if (cleanMsg.length > 2000) e.message = t.errMessageLong;

  errors = e;
  return Object.keys(e).length === 0;
}

function selectSubject(s: Subject) {
  subject = s;
  step = 'details';
}

function goToReview() {
  if (validateDetails()) step = 'review';
}

async function submit() {
  // Honeypot check — abort silently if filled
  if (honeypot) {
    step = 'done';
    return;
  }

  isSubmitting = true;

  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Contact-Token': CONTACT_TOKEN,
      },
      body: JSON.stringify({
        subject,
        name: sanitize(name),
        email: email.trim(),
        message: sanitize(message),
        honeypot,
      }),
    });

    step = res.ok ? 'done' : 'error';
  } catch {
    step = 'error';
  } finally {
    isSubmitting = false;
  }
}

function restart() {
  step = 'subject';
  subject = null;
  name = '';
  email = '';
  message = '';
  honeypot = '';
  errors = {};
}
</script>

<Nav />

<div class="page">
  <section class="hero">
    <h1>{t.title}</h1>
    <p class="subtitle">{t.subtitle}</p>
  </section>

  <!-- Bug encart — always visible, above the form -->
  <section class="section section-alt">
    <div class="inner">
      <h2>{t.bugEncartTitle}</h2>
      <div class="bug-encart">
        <p>{t.bugEncartDesc}</p>
        <div class="bug-encart-links">
          <a
            href="https://github.com/RebelliousSmile/sheetmagnet/issues"
            target="_blank"
            rel="noopener"
            class="btn btn-primary"
          >{t.bugGithubIssues} ↗</a>
          <a
            href="https://github.com/RebelliousSmile/sheetmagnet/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener"
            class="btn btn-secondary"
          >{t.bugContributing} ↗</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="inner">
      <h2>{t.formTitle}</h2>

      <!-- Step indicator -->
      {#if step !== 'done' && step !== 'error'}
        <div class="steps" aria-hidden="true">
          <div class="step-dot" class:active={step === 'subject'} class:done={step !== 'subject'}></div>
          <div class="step-line"></div>
          <div class="step-dot" class:active={step === 'details'} class:done={step === 'review'}></div>
          <div class="step-line"></div>
          <div class="step-dot" class:active={step === 'review'}></div>
        </div>
      {/if}

      <!-- Step 1: Subject -->
      {#if step === 'subject'}
        <h3>{t.subjectTitle}</h3>
        <div class="subject-grid">
          {#each subjects as s}
            <button
              class="subject-card"
              class:selected={subject === s.id}
              onclick={() => selectSubject(s.id)}
            >
              {$lang === 'fr' ? s.label_fr : s.label_en}
            </button>
          {/each}
        </div>

      <!-- Step 2: Details -->
      {:else if step === 'details'}
        <button class="btn-back" onclick={() => { step = 'subject'; errors = {}; }}>{t.back}</button>

        <!-- Honeypot — hidden from real users, filled by bots -->
        <div style="position:absolute; left:-9999px; opacity:0; pointer-events:none;" aria-hidden="true">
          <label for="hp">Leave this empty</label>
          <input id="hp" type="text" name="website" tabindex="-1" autocomplete="off" bind:value={honeypot} />
        </div>

        <div class="form-fields">
          <div class="form-group" class:has-error={errors.name}>
            <label for="contact-name">{t.fieldName}</label>
            <input
              id="contact-name"
              type="text"
              bind:value={name}
              autocomplete="name"
              maxlength="100"
              oninput={() => { if (errors.name) errors = { ...errors, name: undefined }; }}
            />
            {#if errors.name}<span class="field-error">{errors.name}</span>{/if}
          </div>

          <div class="form-group" class:has-error={errors.email}>
            <label for="contact-email">{t.fieldEmail}</label>
            <input
              id="contact-email"
              type="email"
              bind:value={email}
              autocomplete="email"
              maxlength="200"
              oninput={() => { if (errors.email) errors = { ...errors, email: undefined }; }}
            />
            {#if errors.email}<span class="field-error">{errors.email}</span>{/if}
          </div>

          <div class="form-group" class:has-error={errors.message}>
            <label for="contact-message">{t.fieldMessage}</label>
            <textarea
              id="contact-message"
              bind:value={message}
              rows="6"
              maxlength="2000"
              oninput={() => { if (errors.message) errors = { ...errors, message: undefined }; }}
            ></textarea>
            <span class="char-count" class:over={message.length > 2000}>{message.length} / 2000</span>
            {#if errors.message}<span class="field-error">{errors.message}</span>{/if}
          </div>

          <button class="btn btn-primary" onclick={goToReview}>{t.next}</button>
        </div>

      <!-- Step 3: Review -->
      {:else if step === 'review'}
        <button class="btn-back" onclick={() => (step = 'details')}>{t.back}</button>

        <h2>{t.reviewTitle}</h2>
        <div class="review-block">
          <div class="review-row">
            <span class="review-label">{t.reviewSubject}</span>
            <span>{subject ? getSubjectLabel(subject) : ''}</span>
          </div>
          <div class="review-row">
            <span class="review-label">{t.reviewName}</span>
            <span>{sanitize(name)}</span>
          </div>
          <div class="review-row">
            <span class="review-label">{t.reviewEmail}</span>
            <span>{email.trim()}</span>
          </div>
          <div class="review-row review-message">
            <span class="review-label">{t.reviewMessage}</span>
            <span>{sanitize(message)}</span>
          </div>
        </div>

        <div class="review-actions">
          <button class="btn btn-secondary" onclick={() => (step = 'details')}>{t.edit}</button>
          <button class="btn btn-primary" onclick={submit} disabled={isSubmitting}>
            {#if isSubmitting}<span class="spinner"></span>{/if}
            {isSubmitting ? t.sending : t.send}
          </button>
        </div>

      <!-- Done -->
      {:else if step === 'done'}
        <div class="outcome">
          <div class="outcome-icon outcome-icon--success"></div>
          <h2>{t.doneTitle}</h2>
          <p>{t.doneDesc}</p>
        </div>

      <!-- Error -->
      {:else if step === 'error'}
        <div class="outcome">
          <div class="outcome-icon outcome-icon--error"></div>
          <h2>{t.errorTitle}</h2>
          <p>{t.errorDesc}</p>
          <div class="review-actions">
            <button class="btn btn-secondary" onclick={restart}>{t.retry}</button>
            <a
              href="https://github.com/RebelliousSmile/sheetmagnet/issues"
              target="_blank" rel="noopener"
              class="btn btn-primary"
            >{t.githubIssue} ↗</a>
          </div>
        </div>
      {/if}

    </div>
  </section>

  <!-- GitHub section -->
  {#if step === 'subject' || step === 'done'}
    <section class="section section-alt">
      <div class="inner">
        <div class="github-block">
          <div>
            <strong>{$lang === 'fr' ? 'Préférez GitHub ?' : 'Prefer GitHub?'}</strong>
            <p>{$lang === 'fr'
              ? 'Les bugs et demandes de fonctionnalités sont suivis directement dans le dépôt.'
              : 'Bugs and feature requests are tracked directly in the repository.'}</p>
          </div>
          <a
            href="https://github.com/RebelliousSmile/sheetmagnet/issues"
            target="_blank" rel="noopener"
            class="btn btn-secondary"
          >{$lang === 'fr' ? 'Ouvrir un ticket' : 'Open an issue'} ↗</a>
        </div>
      </div>
    </section>
  {/if}
</div>

<style>
  .page { display: flex; flex-direction: column; }

  .inner {
    width: 100%;
    max-width: 680px;
    margin: 0 auto;
    padding: 0 var(--space-lg);
  }

  .hero {
    text-align: center;
    padding: 3.5rem var(--space-lg);
    background: linear-gradient(180deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
    border-bottom: 1px solid var(--color-border);
  }

  .hero h1 { font-size: 2rem; margin-bottom: var(--space-md); }

  .subtitle {
    color: var(--color-text-muted);
    font-size: 1.05rem;
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .section { padding: 3rem var(--space-lg); border-top: 1px solid var(--color-border); }
  .section-alt { background: var(--color-bg-secondary); }
  .section h2 { margin-bottom: var(--space-xl); font-size: 1.2rem; }

  /* Step indicator */
  .steps {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: var(--space-xl);
  }

  .step-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    background: transparent;
    flex-shrink: 0;
    transition: background 0.2s, border-color 0.2s;
  }

  .step-dot.active {
    border-color: var(--color-primary);
    background: var(--color-primary);
  }

  .step-dot.done {
    border-color: var(--color-primary);
    background: var(--color-primary);
    opacity: 0.4;
  }

  .step-line {
    flex: 1;
    height: 2px;
    background: var(--color-border);
  }

  /* Subject grid */
  .subject-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }

  .subject-card {
    padding: var(--space-md) var(--space-lg);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: left;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-text);
    transition: border-color 0.15s, background 0.15s;
  }

  .subject-card:hover { border-color: var(--color-primary); background: var(--color-bg-secondary); }
  .subject-card.selected { border-color: var(--color-primary); background: var(--color-primary-glow); }

  /* Form */
  .form-fields { display: flex; flex-direction: column; gap: var(--space-md); }

  .form-group { display: flex; flex-direction: column; gap: var(--space-xs); }

  .form-group.has-error input,
  .form-group.has-error textarea {
    border-color: var(--color-error);
  }

  .field-error {
    font-size: 0.8rem;
    color: var(--color-error);
  }

  .char-count {
    font-size: 0.75rem;
    color: var(--color-text-dim);
    text-align: right;
  }

  .char-count.over { color: var(--color-error); }

  /* Review */
  .review-block {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    margin-bottom: var(--space-xl);
  }

  .review-row {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    font-size: 0.9rem;
  }

  .review-row:last-child { border-bottom: none; }

  .review-message { align-items: flex-start; }
  .review-message span:last-child { white-space: pre-wrap; line-height: 1.6; color: var(--color-text-muted); }

  .review-label { color: var(--color-text-muted); font-weight: 500; }

  .review-actions {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  /* Outcome */
  .outcome {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl) 0;
  }

  .outcome h2 { font-size: 1.4rem; }
  .outcome p { color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6; max-width: 440px; }

  .outcome-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-bottom: var(--space-sm);
  }

  .outcome-icon--success { background: var(--color-success); }
  .outcome-icon--error { background: var(--color-error); }

  /* Back button */
  .btn-back {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0;
    margin-bottom: var(--space-lg);
    display: inline-block;
  }

  .btn-back:hover { color: var(--color-text); }

  /* GitHub CTA */
  .github-block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xl);
    flex-wrap: wrap;
  }

  .github-block strong { display: block; margin-bottom: var(--space-xs); }
  .github-block p { font-size: 0.9rem; color: var(--color-text-muted); }

  /* Bug encart */
  .bug-encart {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .bug-encart p {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    line-height: 1.7;
    margin: 0;
  }

  .bug-encart-links {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  @media (min-width: 640px) {
    .hero h1 { font-size: 2.5rem; }
    .subject-grid { grid-template-columns: 1fr 1fr; }
  }
</style>
