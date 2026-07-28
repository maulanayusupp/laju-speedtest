// =============================================================================
// Contact deep-links with localized, pre-filled messages. The address comes
// from runtimeConfig so a deployment can change it without a rebuild.
// Email is the only channel — no phone number is published anywhere.
// =============================================================================
import { mailtoLink } from '~/services/contact.service'

export function useContact() {
  const { t } = useI18n()
  const config = useRuntimeConfig()

  const email = computed(() => String(config.public.contactEmail))

  const emailHref = computed(() =>
    mailtoLink(email.value, t('contact.template.subject'), t('contact.template.body')),
  )

  /** Value displayed next to each channel on the contact page. */
  function channelValue(_id: string): string {
    return email.value
  }

  function channelHref(_id: string): string {
    return emailHref.value
  }

  return { email, emailHref, channelValue, channelHref }
}
