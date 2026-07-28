// =============================================================================
// Contact deep-links with localized, pre-filled messages. The channel values
// come from runtimeConfig so a deployment can change them without a rebuild.
// Written channels only — no voice line is published.
// =============================================================================
import { mailtoLink, whatsappLink } from '~/services/contact.service'

export function useContact() {
  const { t } = useI18n()
  const config = useRuntimeConfig()

  const email = computed(() => String(config.public.contactEmail))
  const whatsapp = computed(() => String(config.public.whatsapp))

  const emailHref = computed(() =>
    mailtoLink(email.value, t('contact.template.subject'), t('contact.template.body')),
  )

  const whatsappHref = computed(() =>
    whatsappLink(whatsapp.value, t('contact.template.whatsapp')),
  )

  /** Value displayed next to each channel on the contact page. */
  function channelValue(id: string): string {
    if (id === 'email') return email.value
    return `+${whatsapp.value.replace(/\D/g, '')}`
  }

  function channelHref(id: string): string {
    if (id === 'email') return emailHref.value
    return whatsappHref.value
  }

  return { email, whatsapp, emailHref, whatsappHref, channelValue, channelHref }
}
