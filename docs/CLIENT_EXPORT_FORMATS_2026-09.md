# How owners get their client list out of each booking tool (checked 2026-09-17)

_For the CMS import presets (`controllers/cms/customersController.js`), the Help Center category
"Importing and transferring your data", and the reps' switch conversation. **[O]** = the vendor's
own help page, **[3P]** = another vendor's migration guide, **[U]** = unverified recollection of a
real file: treat as a candidate synonym only. Few vendors publish their header row; the reliable
fix is one real sample file per platform from our first migrating tenants (ask every founding
client for theirs and add it to `test/fixtures/imports/`)._

## 1. At a glance

| Platform | Self-serve? | Where | File | Names | Consent columns | Notes in file? |
|---|---|---|---|---|---|---|
| **Booksy** | **No [O]**: email info.us@booksy.com or in-app chat; some accounts see Clients → More options → Export [3P] | Support | CSV, sometimes two files | unknown | unknown | via support |
| **Fresha** | Yes [O]; needs the "Can download clients" permission | Clients → Clients list → Options → Excel / CSV | CSV, XLSX | first + last | `Accepts marketing`, `Accepts SMS marketing` [O] | yes [3P] |
| **Vagaro** | Yes, owner only [O] | Reports → Customers (Customer List) → Export | **Excel or PDF, no CSV** | `Name` (one column) | none | per customer only |
| **Mindbody** | Partly [O]: Insights → Reports → Clients → Mailing Lists → Export to Excel (package + permissions); the full data set is the PAID Subscriber Data Export at cancellation | Reports | Excel | first + last | opt-in is a FILTER, not a column | paid export |
| **Square** | Yes, Dashboard only [O] | Customers → Directory → Import/Export → Export customers | CSV | first + last (`Surname` in UK) | `Email Unsubscribed` = TRUE, or `Email Subscription Status` | `Memo` |
| **GlossGenius** | Yes, owner, web only [O] | Clients → Export Clients | CSV | **`Name`** | none; `Banned` | no (ask support) |
| **StyleSeat** | Yes [3P] | App → Clients → ⋯ → Export Client List | emailed | unknown | unknown | no |
| **Schedulicity** | now Vagaro (acquired Jan 2025) | Clients → Export to Excel (emailed) [3P] | Excel | first/middle/last [U] | none | not without support |
| **Acuity** | Yes [O] | Clients → Import/export → Export client list | CSV | name, email, phone, notes, `Days since last appointment` | none | yes |
| **Setmore** | Yes [O] | Customers → Options → Export Customers | CSV, **emailed to the owner** | unknown | unknown | unknown |
| **theCut** | **No documentation** | phone contacts or support | | | | |
| **Boulevard** | Yes [O] | Clients → Export current list | CSV: first, last, mobile, email only | first + last | not in the export | custom export from support |
| **Treatwell Connect** | Yes, owner, desktop [O] | Clients → Export | download | first + last | marketing consent status | yes |
| **Treatwell Pro** | Yes, owner [O] | Client list → Export as… | **emailed** | | | |
| **Zenoti** | Yes [O] | Guests → Manage Guests → Excel / PDF / CSV | large files emailed | undocumented | `ReceiveMarketingEmail` [U] | separate reports |
| **Jane** | Owner / Full Access [O] | Reports → List (Patient List) → ⋯ → Export | Excel, CSV | first/middle/last, `Preferred Name` | `Marketing Email Opt-In` | separate report |
| **MassageBook** | Owner only [O] | Business Profile → Clients → Import / Export → Export client file | CSV | first + last | none | **not in the export** |
| **WellnessLiving** | Yes [O] | View All → Clients → Export | csv, xls, pdf | first + last; **`Username` = the email** | none | `Notes` |
| **Momence** | no public documentation | | | | | |
| **Google Contacts** | Yes [O] | contacts.google.com → Export → Google CSV | CSV | `First name`/`Last name` (new) or `Given Name`/`Family Name` (legacy) | | `Notes`, `Labels` |
| **iPhone / iCloud** | Yes | iCloud.com → Contacts → Select All → Export vCard | **.vcf only** | `N`, `FN` | | `NOTE` |

**Never exportable anywhere:** cards on file. Appointment history is always a separate report;
packages, memberships and gift-card balances are generally not in the client file.

## 2. Verbatim or documented header rows

- **MassageBook [O, verbatim]:** `First Name, Last Name, Email Address, Phone Number, Alternate Number, Address 1, Address 2, City, State/Province, Zip/Postal Code, Birthday, Photo URL, Source`
- **GlossGenius [O]:** `Name, Email, Phone, Date of Birth, Banned`
- **Vagaro Customer List [O]:** `Name, Amount Paid, Email, Address, Mobile` (`Cell Phone` on phones)`, Day` (`Day Phone`)`, Night` (`Night Phone`)`, Birthdate, Gender, Customer Since, Last Visited, Employees Seen, Membership, Referred By, Online Booking, Appointments Booked` (`App. Booked`)`, Classes Booked, Check-Ins, Credit Card, Points Earned, No Shows/Cancellations, Tags` + custom fields
- **WellnessLiving [O]:** `Imported, First Name, Last Name, Username, Phone Number, Home Phone Number, Work Phone Number, Birthday, Gender, Address, City, Zip/Postal Code, Location, Client ID, Referred by, Status, Client Type, Notes, Belt, Client Since Date`
- **Fresha import template [O]:** `First name, Last name, Email, Mobile phone, Gender, Client notes, Birthday` (birthday DD-MM-YYYY, or MM-DD-YYYY for US accounts). Export [U]: `Client ID, First Name, Last Name, Full Name, Blocked, Block Reason, Gender, Mobile Number, Telephone, Email, Accepts Marketing, Accepts SMS Marketing, Address, Apartment Suite, Area, City, State, Post Code, Date of Birth, Added, Note, Referral Source`
- **Square [3P + U]:** `Reference ID, First Name, Last Name` (`Surname`)`, Email Address, Phone Number, Nickname, Company Name, Street Address 1, Street Address 2, City, State, Postal Code` (`Postcode`)`, Birthday, Memo, Square Customer ID, Creation Source, First Visit, Last Visit, Transaction Count, Lifetime Spend, Email Subscription Status, Instant Profile`. "Instant Profile" rows are name-only junk from card payments.
- **Mindbody import spec [O]:** `First name, Last name, Country` (required) + `RSSID, Salutation, Middle name, Nickname, Email, Address, Address2, City, State, Postal code, Birthdate, Home phone, Mobile phone, Work phone, Referred by, Medic alert, Emergency contact …, Gender, Notes1, Notes2, Notes3`. Mailing-list birthdays omit the year.
- **Jane [O]:** `Patient Number, Member Since, First Name, Middle Name, Last Name, Email, Home Phone, Mobile Phone, Work Phone, Fax Phone, Street Address, Street Address 2, City, Province, Postal, Country, Birth Date, Sex, …, Referral Source, …, Marketing Email Opt-In, …, Active/Inactive, Preferred Name, Pronouns`
- **Acuity [U]:** `First Name, Last Name, Phone, Email, Notes, Days Since Last Appointment`
- **Boulevard [O]:** first name, last name, mobile number, email address.
- **Google Contacts [O]:** `First name, Middle name, Last name, …, E-mail 1 - Label, E-mail 1 - Value, Phone 1 - Label, Phone 1 - Value, Address 1 - …, Birthday, Notes, Labels`; legacy: `Name, Given Name, Additional Name, Family Name, …, Birthday, Gender, Notes, Group Membership, E-mail 1 - Type, E-mail 1 - Value, Phone 1 - Type, Phone 1 - Value`. Multiple values are joined with ` ::: `.

## 3. What the importer must handle (status in our code)

| Need | Status |
|---|---|
| .xlsx / .xls as well as .csv (Vagaro, Mindbody, Schedulicity are Excel only) | ✅ the CMS panel reads the first sheet |
| One `Name` column (GlossGenius, Vagaro, Acuity, legacy Google) | ✅ `fullName` split, 2026-09-17 |
| UK / EU day-first dates; Fresha follows the account region; no-year birthdays | ✅ `parseBirthdate` + `dayFirstOf`; no-year dates are left empty |
| Consent: Fresha `Accepts marketing` / `Accepts SMS marketing`, Square `Email Unsubscribed` (TRUE = out) + `Email Subscription Status`, Jane `Marketing Email Opt-In`, Treatwell consent status | ✅ `emailOptIn` / `emailOptOut` / `smsOptIn` with wide Yes / No values |
| Several phone columns: prefer the mobile one | ✅ in preset matching |
| Google's `… - Type` / `… - Label` columns must never be taken for the value | ✅ 2026-09-17 |
| Blocked / banned clients (`Banned`, `Blocked`, `Status` = Deactivated) | ✅ imported, tagged "Blocked", email suppressed |
| Junk rows (Square Instant Profiles: a name and nothing else) | ✅ rows with no email and no phone are skipped |
| UTF-8 BOM, semicolon delimiter (EU Excel) | ✅ PapaParse auto-detects both |
| **.vcf (iPhone / iCloud contacts)** | ⬜ not yet: tell the owner to import into Google Contacts and export a Google CSV, or send us the file |
| Upcoming appointments, packages, memberships, gift cards | ⬜ not imported (client list only) |
| Real sample files per platform as test fixtures | ⬜ collect from founding clients |

## 4. Sources

Booksy: https://support.booksy.com/hc/en-us/articles/16539806017938 · https://support.booksy.com/hc/en-us/articles/16484532911890 · https://glossgenius.elevio.help/en/articles/1026-how-to-export-your-data-from-booksy · https://help.husl.io/how-to-export-your-client-data-from-booksy · https://support.heygoldie.com/en/articles/323740-importing-from-booksy · https://support.vagaro.com/hc/en-us/articles/19007441402395
Fresha: https://www.fresha.com/help-center/knowledge-base/clients/58-export-your-client-list · https://www.fresha.com/help-center/knowledge-base/privacy-and-security/197-record-marketing-consent-for-clients · https://www.fresha.com/help-center/knowledge-base/clients/101243-import-your-existing-client-list
Vagaro: https://support.vagaro.com/hc/en-us/articles/360006371094 · https://support.vagaro.com/hc/en-us/articles/115004772554 · https://support.vagaro.com/hc/en-us/articles/204348170
Mindbody: https://support.mindbodyonline.com/s/article/203256833-Mailing-Lists · https://support.mindbodyonline.com/s/article/I-need-to-export-my-Data-Subscriber-Data-Export · https://support.mindbodyonline.com/s/article/203278693-What-does-imported-data-look-like
Square: https://squareup.com/help/us/en/article/6632-import-customers-online · https://community.squareup.com/t5/Archived-Discussions-Read-Only/How-do-you-view-a-customer-s-subscription-status/m-p/16426 · https://support.massagebook.com/hc/en-us/articles/18572159526797
GlossGenius: https://glossgenius.elevio.help/en/articles/792-how-to-export-your-client-list · https://glossgenius.elevio.help/en/articles/847-exporting-your-data-from-another-software
StyleSeat: https://support.heygoldie.com/en/articles/323741-importing-from-styleseat
Schedulicity: https://www.businesswire.com/news/home/20250113173168/en/
Acuity: https://help.acuityscheduling.com/hc/en-us/articles/16676916553485
Setmore: https://support.setmore.com/en/articles/490978-import-or-export-customer-contacts
theCut: https://thecut.co/blog/import-your-clients-to-thecut-app
Boulevard: https://support.boulevard.io/en/articles/9077071-clients-audiences · https://support.boulevard.io/en/articles/11584912
Treatwell: https://partnercare.treatwell.com/s/article/How-do-I-export-my-client-list?language=en_GB · https://propartnercare.treatwell.com/s/?language=en_US&view=article&path=client/How-to-download-the-Client-List
Zenoti: https://help.zenoti.com/en/admin/backup-your-data.html · https://help.zenoti.com/en/loyalty/other-tasks/manage-guest-details.html
Jane: https://jane.app/guide/patients-reports · https://jane.app/guide/importing-from-jane · https://jane.app/guide/diving-deeper-into-importing-to-jane
MassageBook: https://support.massagebook.com/hc/en-us/articles/18572149119757 · https://support.massagebook.com/hc/en-us/articles/18572054781581
WellnessLiving: https://help.wellnessliving.com/en/articles/11055902-export-the-client-list · https://www.wellnessliving.com/knowledge-sharing/knowledge-base/all-clients-report/
Google Contacts: https://support.google.com/contacts/answer/15147365
