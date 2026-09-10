# Spanish translation TODO

Every string below is marked `[ES TODO]` in `locales/es.json` (or, for the
hotel section, in `data/hotels.json`). Replace the `[ES TODO] ` prefix with
the Spanish translation, keeping any `{token}` exactly as written — the site
substitutes it at runtime (`{time}`, `{date}`, `{n}`). Don't translate the
token names themselves.

Listed in the order each string appears on the page. The `key` is its path
in `locales/es.json`, for reference when editing.

**Not included here / left untouched on purpose:**
- A handful of "mechanical" strings that were translated directly rather
  than left as `[ES TODO]`: `Adults`→`Adultos`,
  `Children (12 and under)`→`Niños (12 años o menos)`,
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

## Travel & Stay

### Section chrome (`locales/es.json`)
| key | English |
|---|---|
| `travel.sectionTitle` | Travel & Stay |
| `travel.comingSoon` | Details coming soon |
| `travel.tabsAriaLabel` | Travel sections (screen-reader only, not visible) |
| `travel.tabs.madrid` | Getting to Madrid |
| `travel.tabs.stay` | Where to Stay |
| `travel.tabs.day` | On the Day |
| `travel.tabs.home` | Getting Home |
| `travel.madrid.airport` | Nearest airport: Adolfo Suárez Madrid–Barajas (MAD), about 25 minutes by car from the venue. |
| `travel.madrid.taxiLabel` | Taxi |
| `travel.madrid.taxi` | There's a fixed fare from the airport to central Madrid. |
| `travel.madrid.taxiFareLabel` | Fixed fare |
| `travel.madrid.metroLabel` | Metro / Train |
| `travel.madrid.metro` | Metro Line 8 and Cercanías trains connect the airport to central Madrid. |
| `travel.stay.emptyMessage` | Hotel recommendations are coming soon — we'll update this page as soon as we have them. |
| `travel.stay.priceFromLabel` | From |
| `travel.stay.promoCodeLabel` | Promo code |
| `travel.stay.copyButton` | Copy |
| `travel.stay.copiedConfirmation` | Copied! |
| `travel.stay.bookingLabel` | How to book |
| `travel.stay.bookButton` | Book |
| `travel.stay.cancellationLabel` | Cancellation |
| `travel.stay.shuttleLabel` | Shuttle |
| `travel.stay.shuttleYes` | Shuttle provided |
| `travel.stay.shuttleNo` | No shuttle |
| `travel.stay.shuttleTbc` | Shuttle: details coming soon |
| `travel.stay.badgeFamily` | Our pick for family |
| `travel.stay.badgeGroups` | Best for groups |
| `travel.stay.mapAriaLabel` | Map (screen-reader only, not visible) |
| `travel.stay.mapVenue` | Venue: Club de Tiro Madrid |
| `travel.stay.mapAirport` | Adolfo Suárez Madrid–Barajas Airport |
| `travel.stay.mapCentre` | City centre (Puerta del Sol) |
| `travel.day.times` | Guests are welcome from 18:00. The ceremony starts at 19:00. |
| `travel.day.shuttleHeading` | Shuttle |
| `travel.day.taxiHeading` | Not on the shuttle? |
| `travel.day.addressHeading` | Venue address |
| `travel.day.mapsLink` | View on Google Maps |
| `travel.day.parkingNote` | On-site parking is available. |
| `travel.home.coachHeading` | Coach |
| `travel.home.taxiNote` | The venue is outside the city — taxis cannot be hailed on the street. Please pre-book a taxi or use the coach. |

### Per-hotel content (`data/hotels.json`)
Each hotel has its own `{ "en": "...", "es": "..." }` pairs for `tagline`,
`distanceToVenue`, `distanceToCentre`, `priceNote`, `bookingInstructions`,
and `cancellation` — translate the `es` value directly in that file (same
`[ES TODO] ` convention). Currently populated with real copy (all hotels
still `published: false`):

| hotel id | field | English |
|---|---|---|
| `villa-madrid` | `priceNote` | We recommend choosing the flexible rate. Breakfast is not included by default. |
| `villa-madrid` | `bookingInstructions` | Enter code CLUBDETIRO in the "Promoción" field when booking on hotelvillamadrid.com. |
| `villa-madrid` | `cancellation` | Flexible rate: free cancellation until 20 August 2027. |
| `aravaca-village` | `bookingInstructions` | Book directly with the hotel and mention Cristina & Joe's wedding for 10% off. |
| `zarzuela-park` | `bookingInstructions` | 15% off the web rate with our code. |
| `eurostars-monte-real` | `bookingInstructions` | 15% off the web rate, valid until one week before the wedding. |
| `eurostars-monte-real` | `cancellation` | Free cancellation up to 14 days before arrival; full charge inside 14 days. |

## RSVP
| key | English |
|---|---|
| `rsvp.deadline` | Kindly respond by {date}. |
| `rsvp.deadlineNote` | If you already know you're coming, an early yes helps us with hotel bookings. |
| `rsvp.contactLine` | Questions? Email us at cristinaandjoewedding@outlook.ie |
| `rsvp.reminder.button` | Add a Reminder |
| `rsvp.reminder.ics` | Apple Reminders / Other (.ics) |
| `rsvp.form.fullName.placeholder` | Your full name |
| `rsvp.form.attending.legend` | Will you be attending? |
| `rsvp.form.attending.yes` | Joyfully accepts |
| `rsvp.form.attending.no` | Regretfully declines |
| `rsvp.form.guestCounts.label` | Who's Coming? |
| `rsvp.form.guestCounts.ageHelper` | Anyone aged 13 or over counts as an adult. |
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
