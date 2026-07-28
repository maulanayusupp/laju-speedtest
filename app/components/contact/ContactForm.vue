<script setup lang="ts">
// There is no server-side inbox: the form composes a message and hands it to
// the visitor's own mail client. That is stated in the UI rather than implied,
// and it means the site stores nothing the visitor typed.
import { mailtoLink } from '~/services/contact.service'

const { t } = useI18n()
const { email } = useContact()

const form = reactive({
  name: '',
  reply: '',
  topic: 'general',
  message: '',
})

const topics = ['general', 'accuracy', 'privacy', 'partnership'] as const

const isValid = computed(() => form.name.trim().length > 1 && form.message.trim().length > 9)

function onSubmit() {
  if (!isValid.value) return
  const subject = t('contact.form.subject', { topic: t(`contact.form.topics.${form.topic}`) })
  const body = t('contact.form.body', {
    name: form.name.trim(),
    reply: form.reply.trim() || t('contact.form.noReply'),
    topic: t(`contact.form.topics.${form.topic}`),
    message: form.message.trim(),
  })
  window.location.href = mailtoLink(email.value, subject, body)
}
</script>

<template>
  <form class="form" @submit.prevent="onSubmit">
    <div class="form__row">
      <label class="form__field">
        <span class="form__label">{{ t('contact.form.name') }}</span>
        <input v-model="form.name" class="form__input" type="text" name="name" autocomplete="name" required>
      </label>
      <label class="form__field">
        <span class="form__label">{{ t('contact.form.reply') }}</span>
        <input v-model="form.reply" class="form__input" type="email" name="email" autocomplete="email">
      </label>
    </div>

    <label class="form__field">
      <span class="form__label">{{ t('contact.form.topic') }}</span>
      <select v-model="form.topic" class="form__input" name="topic">
        <option v-for="topic in topics" :key="topic" :value="topic">
          {{ t(`contact.form.topics.${topic}`) }}
        </option>
      </select>
    </label>

    <label class="form__field">
      <span class="form__label">{{ t('contact.form.message') }}</span>
      <textarea v-model="form.message" class="form__input form__input--area" name="message" rows="5" required />
    </label>

    <div class="form__foot">
      <BaseButton type="submit" variant="primary" size="md" :disabled="!isValid">
        <template #icon><BaseIcon name="mail" :size="18" /></template>
        {{ t('contact.form.submit') }}
      </BaseButton>
      <p class="form__note">{{ t('contact.form.note') }}</p>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.form {
  display: grid;
  gap: 0.9rem;
}

.form__row {
  display: grid;
  gap: 0.9rem;

  @include respond-to('sm') {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.form__field {
  display: grid;
  gap: 0.4rem;
}

.form__label {
  @include eyebrow;

  color: var(--c-text-muted);
}

.form__input {
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-sm);
  background: var(--c-surface-2);
  color: var(--c-text);
  font-size: 0.92rem;
  transition: border-color var(--dur-fast) var(--ease-out);

  &:hover {
    border-color: var(--c-line-strong);
  }

  &:focus {
    border-color: var(--c-cyan);
    outline: none;
  }
}

.form__input--area {
  resize: vertical;
  min-height: 8rem;
  font-family: inherit;
}

.form__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
}

.form__note {
  flex: 1 1 18rem;
  font-size: 0.76rem;
  color: var(--c-text-muted);
}
</style>
