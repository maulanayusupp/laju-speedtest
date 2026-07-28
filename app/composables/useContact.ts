// =============================================================================
// Contact deep-links with localized, pre-filled messages. The channel values
// come from runtimeConfig so a deployment can change them without a rebuild.
// =============================================================================
import { mailtoLink, telLink, whatsappLink } from '~/services/contact.service'

export function useContact() {
  const { t } = useI18n()
  const config = useRuntimeConfig()

  const email = computed(() => String(config.public.contactEmail))
  const phone = computed(() => String(config.public.contactPhone))
  const whatsapp = computed(() => String(config.public.whatsapp))

  const emailHref = computed(() =>
    mailtoLink(email.value, t('contact.template.subject'), t('contact.template.body')),
  )

  const whatsappHref = computed(() =>
    whatsappLink(whatsapp.value, t('contact.template.whatsapp')),
  )

  const phoneHref = computed(() => telLink(phone.value))

  /** Value displayed next to each channel on the contact page. */
  function channelValue(id: string): string {
    if (id === 'email') return email.value
    if (id === 'phone') return phone.value
    return `+${whatsapp.value.replace(/\D/g, '')}`
  }

  function channelHref(id: string): string {
    if (id === 'email') return emailHref.value
    if (id === 'phone') return phoneHref.value
    return whatsappHref.value
  }

  return { email, phone, whatsapp, emailHref, whatsappHref, phoneHref, channelValue, channelHref }
}
