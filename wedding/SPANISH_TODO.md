# Spanish translation TODO

Every string below is marked `[ES TODO]` in `locales/es.json`. Replace the
`[ES TODO] ` prefix with the Spanish translation, keeping any `{token}`
exactly as written — the site substitutes it at runtime (`{time}`, `{date}`,
`{n}`). Don't translate the token names themselves.

Listed in the order each string appears on the page. The `key` is its path
in `locales/es.json`, for reference when editing.

**Not included here / left untouched on purpose:**
- The entire **Travel & Accommodations** section — no hotel/transport
  details yet, so it's still hardcoded English in `index.html` with no
  translation keys at all.
- A handful of "mechanical" strings that were translated directly rather
  than left as `[ES TODO]`: `Adults`→`Adultos`, `Children`→`Niños`,
  `Email`→`Correo electrónico`, `Full Name`/`Full name`→`Nombre completo`,
  `Adult {n}`→`Adulto {n}`, `Child {n}`→`Niño {n}`,
  `Days/Hours/Minutes/Seconds`→`Días/Horas/Minutos/Segundos`.
- Proper nouns, addresses, and product names, kept identical in both
  languages: "Cristina & Joe", "Madrid ✦ Dublin", the venue name/address,
  "Google Calendar", "Outlook", "RSVP".

## Page &lt;head&gt;
| key | English |
|---|---|
| `meta.title` | Cristina & Joe \| Our Wedding |
| `meta.description` | Join us as we celebrate the wedding of Cristina and Joe. |

## Nav
| key | English |
|---|---|
| `nav.details` | Details |
| `nav.gallery` | Gallery |
| `nav.travel` | Travel |
| `nav.menuToggle` | Menu |
| `nav.langToggleLabel` | Language |

## Hero
| key | English |
|---|---|
| `hero.eyebrow` | We're getting married |
| `hero.addToCalendar` | Add to Calendar |
| `hero.calendarIcs` | Apple / Other (.ics) |

## Wedding Details
| key | English |
|---|---|
| `details.sectionTitle` | Wedding Details |
| `details.ceremony.title` | Ceremony |
| `details.ceremony.arrival` | Please arrive from {time}. |
| `details.reception.title` | Reception |
| `details.reception.time` | Until {time} |
| `details.dressCode.title` | Dress Code |
| `details.dressCode.body` | What to wear: Smart but comfortable — wear whatever you feel good in. Fair warning, it'll likely be warm, so lads, linen is a good shout if you have it, though no need to go buying one. The ceremony is outside on the grass and dinner is indoors with the air-con on, so bring a light jacket or wrap in case you get chilly later. The venue will have sun umbrellas out for the ceremony, and heels are no bother — there'll be heel protectors on hand for the lawn. |

## Gallery
| key | English |
|---|---|
| `gallery.sectionTitle` | Gallery |
| `gallery.subtitle` | A few of our favorite moments. |
| `gallery.alt.familyBeach` | Cristina and Joe on the beach with family |
| `gallery.alt.plazaSelfie` | Cristina and Joe in a Spanish plaza |
| `gallery.alt.formalPortrait` | Cristina and Joe dressed up for an evening out |
| `gallery.alt.castle` | Cristina and Joe in front of a castle |
| `gallery.alt.familyParade` | Cristina and Joe with the kids at a St. Patrick's Day parade |
| `gallery.alt.familyTerrace` | Cristina and Joe with the kids on a terrace |

## Travel & Accommodations
Intentionally skipped — see note above.

## RSVP
| key | English |
|---|---|
| `rsvp.deadline` | Kindly respond by {date}. |
| `rsvp.deadlineNote` | If you already know you're coming, an early yes helps us with hotel bookings. |
| `rsvp.contactLine` | Questions? Email us at cristinaandjoewedding@outlook.com |
| `rsvp.reminder.button` | Add a Reminder |
| `rsvp.reminder.ics` | Apple Reminders / Other (.ics) |
| `rsvp.form.fullName.placeholder` | Your full name |
| `rsvp.form.attending.legend` | Will you be attending? |
| `rsvp.form.attending.yes` | Joyfully accepts |
| `rsvp.form.attending.no` | Regretfully declines |
| `rsvp.form.guestCounts.label` | Who's Coming? |
| `rsvp.form.guestList.dietaryPlaceholder` | Dietary restrictions / allergies (optional) |
| `rsvp.form.message.label` | Message for the Couple (optional) |
| `rsvp.form.message.placeholder` | Anything else you'd like to share? |
| `rsvp.form.submit` | Send RSVP |
| `rsvp.form.errorGeneric` | Something went wrong sending your RSVP. Please try again in a moment. |
| `rsvp.success.title` | Thank you! |
| `rsvp.success.body` | Your RSVP has been sent. We can't wait to celebrate with you. |

## Calendar / reminder invite text
These go into the actual .ics/Google/Outlook calendar entries, not visible
on the page itself.

| key | English |
|---|---|
| `calendar.wedding.title` | Cristina & Joe's Wedding |
| `calendar.wedding.description` | Join us as we celebrate the wedding of Cristina and Joe! Arrival from 6:00 PM, ceremony at 7:00 PM. More info: https://cristinaandjoewedding.com |
| `calendar.reminder.title` | Reminder: RSVP for Cristina & Joe's Wedding |
| `calendar.reminder.description` | Don't forget to RSVP for Cristina and Joe's wedding! https://cristinaandjoewedding.com/#rsvp |

## Footer
Nothing to do — `footer.line` ("Cristina & Joe · {date}") has no English
words to translate.
