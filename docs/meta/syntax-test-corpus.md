# Syntax test corpus

Editors only — not linked from grammar pages. Working sheet for Phase 2a of the expressiveness review (`docs/proposals/expressiveness-review.md`).

Source: *Conlang Syntax Test Cases* (218 sentences culled from *1200 Graded Sentences for Analysis*), originally on fiziwig.com, mirrored at <https://cofl.github.io/conlang/resources/mirror/conlang-syntax-test-cases.html>. Numbering follows the source list; cite rows as `STC-nn`. English is copied verbatim, including the source's typos.

## When a sentence will not translate as is

Translate with published grammar and lexicon. When a sentence cannot be said, sort the blocker into one of three kinds:

| Blocker | Action |
|---------|--------|
| **Parser miss**: the docs already imply the reading, but the parser rejects or misreads it | Fix the parser, add a test, and list the fix under **Parser fixes** in [syntax-test-results](syntax-test-results.md). If the fix adds a construction, add one example on its anchor page. |
| **Grammar gap**: no taught form says it, or the docs leave the reading undecided | Do not invent or apply new grammar. Log a `G-nn` row in [syntax-test-results](syntax-test-results.md) with the current route, a recommendation, and a priority. The language owner decides it explicitly. Translate with the best existing route meanwhile, and mark the row **awkward (G-nn)**. |
| **Missing vocabulary**: the grammar works, but no root fits | Generate the vocabulary: add a lexicon row, or role English on an existing row (`npm run lint:lexicon`, then `npm run build`). Record it as an `L-nn` row. Use a stand-in only until the row exists. |

Before logging a grammar gap:

1. Run `node scripts/find-english.mjs '<phrase>'` on the English and on one or two rewordings.
2. Try the recurring fixes: a resume hook (`or` / `er` / `ar` / `ur`), counting from the end (`gruedul`), the discourse hooks (`ael` / `aol`), and a time pole plus PLAN.
3. If the English puts a feeling, belief, want or other stance on **someone other than the speaker** (*she was hurt*, *he thinks*, *it makes sense that you feel*), it is almost never a gap. This has been logged as one several times. Name that person as the holder on the channel, MAY or NOTIONAL word that gives you access to their view (`thunemuzazon`, `thewamehon`, `thunelober`: [whose view](../grammar/knowing.md#holder)). For a stance **on** their stance, put your stance in the main sentence and theirs in a dependent with its own holder seam word, naming what their feeling is about (`wadotham gobum zarl zevor wanathumam gobum thunemehon`).
4. Record the phrases you tried in the gap row.

Every Agazan line below was checked with `node scripts/parse.mjs`.

## Translations

| STC | English | Agazan | Morph gloss | Verdict |
|-----|---------|--------|-------------|---------|
| 1 | The sun shines. | `zuzalor voyolol.` | z-←sun \| v-shine | covered |
| 2 | The sun is shining. | `zuzalor thodom voyolol.` | z-←sun \| th-LIVE \| v-shine | covered |
| 3 | The sun shone. | `zuzalor thevom voyolol.` | z-←sun \| th-MEMORY \| v-shine | covered |
| 4 | The sun will shine. | `zuzalor thobam bral voyolol.` | z-←sun \| [th-PATTERN \| b-later] \| v-shine | covered |
| 5 | The sun has been shining. | `zuzalor thodom hagem voyolol.` | z-←sun \| th-LIVE \| h-still \| v-shine | covered |
| 6 | The sun is shining again. | `zuzalor thodom huregem voyolol.` | z-←sun \| th-LIVE \| h-again \| v-shine | covered |
| 7 | The sun will shine tomorrow. | `zuzalor thobam bozarom grawol voyolol.` | z-←sun \| [th-PATTERN \| [b-day \| g-one]] \| v-shine | covered |
| 8 | The sun shines brightly. | `zuzalor hoyolol voyolol.` | z-←sun \| h-bright \| v-shine | covered |
| 9 | The bright sun shines. | `zuzalor goyolol voyolol.` | [z-←sun \| g-bright] \| v-shine | covered |
| 10 | The sun is rising now. | `zuzalor thodom vabuhem.` | z-←sun \| th-LIVE \| v-rise | covered |
| 11 | All the people shouted. | `zual gobel thevom vazawal.` | [z-everything \| g-person] \| th-MEMORY \| v-shout | covered |
| 12 | Some of the people shouted. | `zoberx gram thevom vazawal.` | [z-←person-x \| g-more-than-one.about] \| th-MEMORY \| v-shout | covered |
| 13 | Many of the people shouted twice. | `zoberx thobam zel gral thevom vazawal hradul.` | [z-←person-x \| th-PATTERN \| z-rank/more \| g-amount] \| th-MEMORY \| v-shout \| h-two | covered |
| 14 | Happy people often shout. | `zobelx gogamam thobam zel hral vazawal.` | [[z-person-x \| g-delight] \| th-PATTERN \| z-rank/more \| h-how-often] \| v-shout | by design (G-01) |
| 15 | The kitten jumped up. | `zubuyoxegazor thevom vugazal habuhem.` | z-baby-x-cat \| th-MEMORY \| v-jump \| h-rise | covered |
| 16 | The kitten jumped onto the table. | `zubuyoxegazor thevom vugazal aol bexogadol.` | z-baby-x-cat \| th-MEMORY \| v-jump \| [on \| b-scene-x-cutlery] | covered |
| 17 | My little kitten walked away. | `glumazom zubuyoxegazol em bamun thevom voworelum.` | [gl-small \| z-baby-x-cat] \| [used-by \| b-speaker] \| th-MEMORY \| v-recede | covered |
| 18 | It's raining. | `thodom vurelal.` | th-LIVE \| v-rain | covered |
| 19 | The rain came down. | `zurelal thevom vadahel.` | z-rain \| th-MEMORY \| v-fall | covered |
| 20 | The kitten is playing in the rain. | `zubuyoxegazor thodom vubuham am burelal.` | z-baby-x-cat \| th-LIVE \| v-play \| [amid \| b-rain] | covered |
| 21 | The rain has stopped. | `thodom hewem vurelal.` | th-LIVE \| h-no-longer \| v-rain | covered |
| 22 | Soon the rain will stop. | `thunem brabum hewem vurelal.` | [th-CLUES \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 23 | I hope the rain stops soon. | `thoyuyom thunem brabum hewem vurelal.` | th-hope \| [th-CLUES \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 24 | Once wild animals lived here. | `zuluzulx guluzum om bamun henom vawuhom.` | [z-leopard-x \| g-nature] \| [near \| b-speaker] \| h-FORMER \| v-home | covered |
| 25 | Slowly she looked around. | `hazuzom zolozun thevom vazebom ol bual.` | h-slow \| z-Olozun \| th-MEMORY \| v-look \| [at \| b-everything] | covered |
| 26 | Go away! | `yel vevubelum.` | y-command \| v-go-recede | covered |
| 27 | Let's go! | `yem zahan vevubel.` | y-request \| z-interlocutors \| v-go | covered |
| 28 | You should go. | `zehon vevubel thegathem.` | z-listener \| v-go \| th-sake-ought-offered | covered |
| 29 | I will be happy to go. | `zamun thamam vevubel thozothamam.` | z-speaker \| th-plan-itinerary \| v-go \| th-pleasure-met-any-term-INTERNAL-FLOWING | covered |
| 30 | He will arrive soon. | `zuzazon thunem brabum vevurol.` | z-Uzazon \| [th-CLUES \| b-+-e-.about] \| v-arrival | covered |
| 31 | The baby's ball has rolled away. | `zobovol em bubuyol hamom vewevolum.` | z-ball \| [used-by \| b-baby] \| h-RESIDUE \| v-wheel-recede | covered |
| 32 | The two boys are working together. | `zoboyolx gradul thodom vezebomx.` | [z-boy-x \| g-two] \| th-LIVE \| v-effort-x | covered |
| 33 | This mist will probably clear away. | `zovalul om bamun thral thunem bral vememulum.` | z-fog \| [near \| b-speaker] \| th-likely \| [th-CLUES \| b-later] \| v-melt-recede | covered |
| 34 | Lovely flowers are growing everywhere. | `zovalolx gehalom thodom vuzem ol bual.` | [z-flower-x \| g-beauty] \| th-LIVE \| v-growth \| [at \| b-everything] | covered |
| 35 | We should eat more slowly. | `zahan thobam zel hazuzom vogadol thegathem.` | [z-interlocutors \| th-PATTERN \| z-rank/more \| h-slow] \| v-eat \| th-sake-ought-offered | covered |
| 36 | You have come too soon. | `zehon thegatham zuel bral vevubel oel bamun.` | [z-listener \| th-sake-met-any-term \| z-rank/less \| b-later] \| v-go \| [toward \| b-speaker] | covered |
| 37 | You must write more neatly. | `zehon thobam zel hozobum vuruyel thumem.` | [z-listener \| th-PATTERN \| z-rank/more \| h-cleanliness] \| v-write \| th-REQUIRE-demanded | covered |
| 38 | Directly opposite stands a wonderful palace. | `honahethahan zugahol gezum vonevol.` | h-north-th-interlocutors \| [z-castle \| g-amazement] \| v-stand | covered |
| 39 | Henry's dog is lost. | `zodozol gayorum em buzazon.` | [z-dog \| g-loss] \| [used-by \| b-Uzazon] | covered |
| 40 | My cat is black. | `zegazol gabulol em bamun.` | [z-cat \| g-black] \| [used-by \| b-speaker] | covered |
| 41 | The little girl's doll is broken. | `zaneval gulahum em begeyol gumazom.` | [z-nesting-doll \| g-breakdown] \| [used-by \| [b-girl \| g-small]] | covered |
| 42 | I usually sleep soundly. | `zamun huam vuzevol hanudom.` | z-speaker \| h-always.open \| v-sleep \| h-depth | covered |
| 43 | The children ran after Jack. | `zahayolx thevom dehalon vahovem.` | z-child-x \| th-MEMORY \| d-Ehalon \| v-pursuit | covered |
| 44 | I can play after school. | `zamun vubuhaxam hanom buzuhol.` | z-speaker \| v-play-able \| [h-after \| b-school] | covered |
| 45 | We went to the village for a visit. | `zahan thevom vevubel oel bahuhom hogom boworelol.` | z-interlocutors \| th-MEMORY \| v-go \| [toward \| b-locality] \| [h-so-that \| b-attend] | covered |
| 46 | We arrived at the river. | `zahan thevom vevurol ol bowolal.` | z-interlocutors \| th-MEMORY \| v-arrival \| [at \| b-drinking-water] | covered |
| 47 | I have been waiting for you. | `zamun thodom hagem dehon vubahom.` | z-speaker \| th-LIVE \| h-still \| d-listener \| v-wait | covered |
| 48 | The campers sat around the fire. | `zaxagahalx thevom vehuhol hugem bavalul.` | z-agent-x-camp-x \| th-MEMORY \| v-sit \| [h-around \| b-fire] | covered |
| 49 | A little girl with a kitten sat near me. | `glumazom zegeyol gan bubuyoxegazol thevom vehuhol om bamun.` | [gl-small \| z-girl \| [g-including \| b-baby-x-cat]] \| th-MEMORY \| v-sit \| [near \| b-speaker] | covered |
| 50 | The child waited at the door for her father. | `zahayor thevom vubahom ol boyel glemegol dobel grebuwol bahayor.` | z-←child \| th-MEMORY \| v-wait \| at \| b-door \| gl-male \| d-person \| g-#-e-1 \| b-←←child | covered |
| 51 | Yesterday the oldest girl in the village lost her kitten. | `zegeyol zel goberom al bahuhom thevom bozarom gruwol dubuyoxegazol em begeyor vayorum.` | [z-girl \| z-rank/more \| g-age] \| [in \| b-locality] \| [th-MEMORY \| [b-day \| g-minus-one]] \| d-baby-x-cat \| [used-by \| b-←girl] \| v-loss | covered |
| 52 | Were you born in this village? | `yol ? zehon al bahuhom om bamun vohal.` | y-question \| ? \| z-listener \| [in \| b-locality] \| [near \| b-speaker] \| v-hatch | covered |
| 53 | Can your brother dance well? | `yol ? glemegol zobel grebazol behon vudaroxal hobedom.` | y-question \| [? \| gl-male \| z-person \| [g-#-e0 \| b-listener]] \| v-dance-able \| h-excellence | covered |
| 54 | Did the man leave? | `yol ? zamayor veyorul.` | y-question \| ? \| z-←man \| v-departure | covered |
| 55 | Is your sister coming for you? | `yol ? glavegol zobel grebazol behon vevubel oel behon.` | y-question \| [? \| gl-female \| z-person \| [g-#-e0 \| b-listener]] \| v-go \| [toward \| b-listener] | covered |
| 56 | Can you come tomorrow? | `yol ? zehon thamam bozarom grawol vevubel oel bamun.` | y-question \| ? \| z-listener \| [th-plan-itinerary \| [b-day \| g-one]] \| v-go \| [toward \| b-speaker] | covered |
| 57 | Have the neighbors gone away for the winter? | `yol ? zaxawuhomx om bahan hamom vevubelum huwem bugabam.` | y-question \| ? \| z-agent-x-home-x \| [near \| b-interlocutors] \| h-RESIDUE \| v-go-recede \| [h-while \| b-winter] | covered |
| 58 | Does the robin sing in the rain? | `yol ? zuam geroloxobezol vezeyol am burelal.` | y-question \| [? \| z-everything.open \| g-red-x-bird] \| v-sing \| [amid \| b-rain] | covered |
| 59 | Are you going with us to the concert? | `yol ? zehon han bamunx vevubel oel bexezeyol.` | y-question \| ? \| z-listener \| [h-including \| b-speaker-x] \| v-go \| [toward \| b-scene-x-sing] | covered |
| 60 | Have you ever travelled in the jungle? | `yol ? zehon hoham vehevam am baboloxodelolx har.` | y-question \| ? \| z-listener \| h-already \| v-voyage \| [amid \| b-palm-x-tree-x] \| h-when | covered |
| 61 | We sailed down the river for several miles. | `zamunx thevom bezerem grabarem veheval uol bowolal.` | z-speaker-x \| [th-MEMORY \| [b-meter \| g-+-e3.about]] \| v-ship \| [through \| b-drinking-water] | covered |
| 62 | Everybody knows about hunting. | `zuam vugum hohagem bawuzum.` | z-everything.open \| v-knowledge \| [h-topic \| b-predation] | covered |
| 63 | On a Sunny morning after the solstice we started for the mountains. | `ol bederom guzalol hanom buzaloxuzahul zamunx thevom dumaholx vevubeloel.` | [at \| [b-dawn \| g-sun]] \| [h-after \| b-sun-x-stop] \| z-speaker-x \| th-MEMORY \| d-mountain-x \| v-go-head-for | covered |
| 64 | Tom laughed at the monkey's tricks. | `zamazal vedeyum. zuzazon thevom valamal ol bedeyur.` | z-monkey \| v-mischief . z-Uzazon \| th-MEMORY \| v-laugh \| [at \| b-←mischief] | covered |
| 65 | An old man with a walking stick stood beside the fence. | `zalayel gan bugewol thevom vonevol om buwulegahul.` | [z-old-man \| [g-including \| b-cane]] \| th-MEMORY \| v-stand \| [near \| b-fence] | covered |
| 66 | The squirrel's nest was hidden by drooping boughs. | `denelal em buzazal thevom zodeloxobolx gadahel vohevom.` | d-nest \| [used-by \| b-chipmunk] \| th-MEMORY \| [z-tree-x-bone-x \| g-down] \| v-concealment | covered |
| 67 | The little seeds waited patiently under the snow for the warm spring sun. | `glumazom zuzelx hadahel bozulal thevom helazam vubahom duzalol wumazom guhamol guwem buhalom.` | [gl-small \| z-seedling-x] \| [h-down \| b-snow] \| th-MEMORY \| h-composure \| v-wait \| [d-sun \| [w-small \| g-hot] \| [g-while \| b-spring]] | covered |
| 68 | Many little girls with wreaths of flowers on their heads danced around the bonfire. | `zegeyolx gumazom gan bovalolegebelx thobam zel gral thevom vudarol hugem bavalul.` | [[z-girl-x \| g-small \| [g-including \| b-wreath-x]] \| th-PATTERN \| z-rank/more \| g-amount] \| th-MEMORY \| v-dance \| [h-around \| b-fire] | covered |
| 69 | The cover of the basket fell to the floor. | `zabuhel gobom bubawal thevom vadahel oel bawuholunolal.` | [z-up \| [g-part-of \| b-basket]] \| th-MEMORY \| v-fall \| [toward \| b-floor] | covered |
| 70 | The first boy in the line stopped at the entrance. | `zoboyol grewol thevom vuzahul ol boyel.` | [z-boy \| g-1st] \| th-MEMORY \| v-stop \| [at \| b-door] | covered |
| 71 | On the top of the hill in a little hut lived a wise old woman. | `aol bumahol thavom al bahuhol gumazom vawuhom zoleyel geleyem.` | [on \| b-mountain] \| th-NOTIONAL \| [in \| [b-hut \| g-small]] \| v-home \| [z-old-woman \| g-wisdom] | covered |
| 72 | During our residence in the country we often walked in the pastures. | `zamunx thobam zel hral thevom voworel am buvehalx huwem barl zamunx vawuhom am bogahom.` | [z-speaker-x \| th-PATTERN \| z-rank/more \| h-how-often] \| th-MEMORY \| v-walk \| [amid \| b-field-x] \| [h-while \| b-that-clause] \| z-speaker-x \| v-home \| [amid \| b-rural] | covered |
| 73 | When will your guests from the city arrive? | `yol har glagum bazohom zobelx ganadom behon thunem bral vevurol.` | y-question \| h-when \| [[gl-origin \| b-urban] \| z-person-x \| [g-hospitality \| b-listener]] \| [th-CLUES \| b-later] \| v-arrival | covered |
| 74 | Near the mouth of the river, its course turns sharply towards the East. | `om bamabal gobom bowolal zowolar honawum voregom oel bodul.` | [near \| [b-mouth \| [g-part-of \| b-drinking-water]]] \| z-←drinking-water \| h-severity \| v-turn \| [toward \| b-east] | covered |
| 75 | Between the two lofty mountains lay a fertile valley. | `hazam bumaholx gradul gadahom zadahel gomulom.` | [h-between \| [b-mountain-x \| g-two \| g-height]] \| [z-down \| g-proliferation] | covered |
| 76 | Among the wheat grew tall red poppies. | `am begulal thevom vuzem zovalolx gadahom gerolol.` | [amid \| b-grain] \| th-MEMORY \| v-growth \| [z-flower-x \| g-height \| g-red] | covered |
| 77 | The strong roots of the oak trees were torn from the ground. | `dodeloxuvubolx gubabom gobom bunadulodelolx thevom habavum vahegum ual bunolal.` | [d-tree-x-foot-x \| g-strength \| [g-part-of \| b-oak-x]] \| th-MEMORY \| h-force \| v-removal \| [out-of \| b-ground] | covered |
| 78 | The sun looked down through the branches upon the children at play. | `zuzalor thevom hadahel uol bodeloxobolx vazebom ol bahayolx gaxubuham.` | z-←sun \| th-MEMORY \| h-down \| [through \| b-tree-x-bone-x] \| v-look \| [at \| [b-child-x \| g-agent-x-recreation]] | covered |
| 79 | The west wind blew across my face like a friendly caress. | `zewolol gowehel thevom vewolol hebum buvemol em bamun humum behayal gozumam.` | [z-wind \| g-west] \| th-MEMORY \| v-wind \| [h-across \| b-face] \| [used-by \| b-speaker] \| [h-like \| [b-hug \| g-goodwill]] | covered |
| 80 | The spool of thread rolled across the floor. | `zayalal thevom vewevol hebum bawuholunolal.` | z-yarn \| th-MEMORY \| v-wheel \| [h-across \| b-floor] | covered |
| 81 | A box of growing plants stood in the Window. | `zabagal gahem bubalolx gaxuzem thevom vonevol al bewehol.` | [z-package \| [g-contents \| [b-house-plant-x \| g-agent-x-growth]]] \| th-MEMORY \| v-stand \| [in \| b-window] | covered |
| 82 | I am very happy. | `weluzom thozothamam.` | [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] | covered |
| 83 | These oranges are juicy. | `zudadorx gohudal om bamun.` | [z-←tangerine-x \| g-juice] \| [near \| b-speaker] | covered |
| 84 | Sea water is salty. | `zuam gohelaxowolal gozodal.` | [z-everything.open \| g-ocean-x-drinking-water] \| g-salt | covered |
| 85 | The streets are full of people. | `zobelx thobam zel gral al borohelx.` | [z-person-x \| th-PATTERN \| z-rank/more \| g-amount] \| [in \| b-road-x] | covered |
| 86 | Sugar tastes sweet. | `zual gagadam gozom thobam.` | [z-everything \| g-sugar] \| g-sweetness \| th-PATTERN | covered |
| 87 | The fire feels hot. | `zavalur guhamol thodom.` | [z-←fire \| g-hot] \| th-LIVE | covered |
| 88 | The little girl seemed lonely. | `thanathumam thunemegeyor.` | th-relatedness-unmet-modifiable-INTERNAL-FLOWING \| th-CLUES-←girl | by design (G-01) |
| 89 | The little boy's father had once been a sailor. | `glemegol zobel gaxeheval grebuwol boboyol gumazom henom.` | [gl-male \| z-person \| g-agent-x-ship \| [g-#-e-1 \| [b-boy \| g-small]]] \| h-FORMER | covered |
| 90 | I have lost my blanket. | `zamun hamom dayalam em bamun vayorum.` | z-speaker \| h-RESIDUE \| d-blanket \| [used-by \| b-speaker] \| v-loss | covered |
| 91 | A robin has built his nest in the apple tree. | `zeroloxobezol hamom denelal vuguyol al baledoxodelol.` | z-red-x-bird \| h-RESIDUE \| d-nest \| v-construct \| [in \| b-apple-x-tree] | covered |
| 92 | At noon we ate our lunch by the roadside. | `h_12 zamunx thevom denodal em bamunx vogadol om bexevubel.` | h-_12 \| z-speaker-x \| th-MEMORY \| d-bento \| [used-by \| b-speaker-x] \| v-eat \| [near \| b-scene-x-footprints] | covered |
| 93 | Mr. Jones made a knife for his little boy. | `zehalon thevom donawul vemayal el boboyol gumazom grebawol behalor.` | z-Ehalon \| th-MEMORY \| d-knife \| v-manufacture \| [for \| [b-boy \| g-small \| [g-#-e1 \| b-←Ehalon]]] | covered |
| 94 | Their voices sound very happy. | `weluzom thozothamam thodomoberx.` | [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] \| th-LIVE-←person-x | covered |
| 95 | Is today Monday? | `yol ? zolarem grewol thodom.` | y-question \| [? \| z-weekday \| g-1st] \| th-LIVE | covered |
| 96 | Have all the leaves fallen from the tree? | `yol ? zual gelalol ul bodelol hoham vadahel.` | y-question \| [? \| z-everything \| g-leaf] \| [from \| b-tree] \| h-already \| v-fall | covered |
| 97 | Will you be ready on time? | `yol ? zehon thunem bral vabam hawarem.` | y-question \| ? \| z-listener \| [th-CLUES \| b-later] \| v-preparation \| h-punctuality | covered |
| 98 | Will you send this message for me? | `yem zehon dumegom om bamun voboham hadem bamun.` | y-request \| z-listener \| d-message \| [near \| b-speaker] \| v-dispatch \| [h-on-behalf-of \| b-speaker] | covered |
| 99 | Are you waiting for me? | `yol ? zehon damun vubahom.` | y-question \| ? \| z-listener \| d-speaker \| v-wait | covered |
| 100 | Is this the first kitten of the litter? | `yol ? zubuyoxegazor g#1e0 om bamun.` | y-question \| [? \| z-baby-x-cat \| g-#-1e0] \| [near \| b-speaker] | covered |
| 101 | Are these shoes too big for you? | `yol ? zuhubarx thegatham behon zel geluzom.` | y-question \| [? \| z-←shoe-x \| [th-sake-met-any-term \| b-listener] \| z-rank/more \| g-big] | covered |
| 102 | How wide is the River? | `yol zowolar wrar gagoram.` | y-question \| z-←drinking-water \| [w-how-many \| g-width] | covered |
| 103 | Listen. | `yel vewam.` | y-command \| v-listening | covered |
| 104 | Sit here by me. | `yel vehuhol om bamun.` | y-command \| v-sit \| [near \| b-speaker] | covered |
| 105 | Keep this secret until tomorrow. | `yel darth vehamum homam bozarom grawol.` | y-command \| d-that-same-claim \| v-confidentiality \| [h-until \| [b-day \| g-one]] | covered |
| 106 | Come with us. | `yel han bamunx vevubel.` | y-command \| [h-including \| b-speaker-x] \| v-go | covered |
| 107 | Bring your friends with you. | `yel han bobelx gameyom behon vevubel oel bamun.` | y-command \| [h-including \| [b-person-x \| [g-companionship \| b-listener]]] \| v-go \| [toward \| b-speaker] | covered |
| 108 | Be careful. | `yel guyelom.` | y-command \| g-caution | covered |
| 109 | Have some tea. | `yem dedadal gral vodedal.` | y-request \| [d-tea \| g-more-than-one] \| v-drink | covered |
| 110 | Pip and his dog were great friends. | `zuzazon zodozol em buzazor zal weluzom gameyom thevom.` | [z-Uzazon \| [z-dog \| [used-by \| b-←Uzazon]] \| z-and \| [w-very \| g-companionship]] \| th-MEMORY | awkward (G-17) |
| 111 | John and Elizabeth are brother and sister. | `zuzazon gemegol zolozun gavegol zal grebazol.` | [[z-Uzazon \| g-male] \| [z-Olozun \| g-female] \| z-and \| g-#-e0] | awkward (G-17) |
| 112 | You and I will go together. | `zahan thamam vevubelx.` | z-interlocutors \| th-plan-itinerary \| v-go-x | covered |
| 113 | They opened all the doors and windows. | `zobelx thevom dual goyel voyel xal zoberx dual gewehol voyel.` | [z-person-x \| th-MEMORY \| [d-everything \| g-door] \| v-open \| x-and \| z-←person-x-x \| [d-everything \| g-window] \| v-open] | covered |
| 114 | He is small, but strong. | `zuzazon gumazom. xegahum zuzazor gubabom.` | z-Uzazon \| g-small . x-but \| z-←Uzazon \| g-strength | covered |
| 115 | Is this tree an oak or a maple? | `yol zodelor gunadulodelol gomelol ?gar.` | y-question \| z-←tree \| [g-oak \| g-maple \| ?g-wh] | covered |
| 116 | Does the sky look blue or gray? | `yol zagolom gubulol gegulol ?gar thodom.` | y-question \| [z-sky \| [g-blue \| g-gray \| ?g-something]] \| th-LIVE | covered |
| 117 | Come with your father or mother. | `yel han bobel grebuwol behon vevubel oel bamun.` | y-command \| [h-including \| [b-person \| [g-#-e-1 \| b-listener]]] \| v-go \| [toward \| b-speaker] | covered |
| 118 | I am tired, but very happy. | `zamun gadamul. xegahum weluzom thozothamam.` | z-speaker \| g-tired . x-but \| [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] | covered |
| 119 | He played a tune on his wonderful flute. | `zuzazon thevom dudurel vamum ael buvurol gezum em buzazor.` | z-Uzazon \| th-MEMORY \| d-tune \| v-performance \| [using \| [b-flute \| g-amazement]] \| [used-by \| b-←Uzazon] | covered |
| 120 | Toward the end of August the days grow much shorter. | `om b_#31,8 zozaromx thobam zuel weluzom gadarem thobam.` | [near \| b-_31,8] \| [z-day-x \| th-PATTERN \| z-rank/less \| [w-very \| g-duration]] \| th-PATTERN | covered |
| 121 | A company of soldiers marched over the hill and across the meadow. | `aom bumahol gumazom zayoyulx thevom voworelx hebum bogudalx.` | [over \| [b-mountain \| g-small]] \| z-guard-x \| th-MEMORY \| v-walk-x \| [h-across \| b-greens-x] | covered |
| 122 | The first part of the story is very interesting. | `zuyager weluzom gegazom gobom bozem.` | [z-←begin \| [w-very \| g-curiosity] \| [g-part-of \| b-tale]] | covered |
| 123 | The crow dropped some pebbles into the pitcher and raised the water to the brim. | `zabuloxobezol thevom daralolx gumazom vadahel al bamedal xan zabuloxobezor dowolar vabuhel oel babuhel gobom bamedar.` | [z-black-x-bird \| th-MEMORY \| [d-rock-x \| g-small] \| v-fall \| [in \| b-amphora] \| x-and-then \| z-←black-x-bird \| d-←drinking-water \| v-up \| [toward \| [b-up \| [g-part-of \| b-←amphora]]]] | covered |
| 124 | The baby clapped her hands and laughed in glee. | `zubuyor thevom vugayal valamal val hogamam.` | z-←baby \| th-MEMORY \| [v-clap \| v-laugh \| v-and \| h-delight] | covered |
| 125 | Stop your game and be quiet. | `yel hewem vubuham xal guzomom.` | y-command \| [h-no-longer \| v-play \| x-and \| g-silence] | covered |
| 126 | The sound of the drums grew louder and louder. | `zadewol gagum badorolx thevom hogawom varorel.` | [z-audio \| [g-origin \| b-drum-x]] \| th-MEMORY \| h-volume \| v-uptrend | covered |
| 127 | Do you like summer or winter better? | `yol zehon dazadom dugabam ?der velamam.` | y-question \| z-listener \| [d-summer \| d-winter \| ?d-which-rank] \| v-cherished | covered |
| 128 | That boy will have a wonderful trip. | `zoboyor thunem bral vehevam hezum.` | z-←boy \| [th-CLUES \| b-later] \| v-voyage \| h-amazement | covered |
| 129 | They popped corn, and then sat around the fire and ate it. | `zobelx thevom doradal vugudol xan zoberx vehuhol hugem bavalul xan zoberx doradar vogadol.` | [z-person-x \| th-MEMORY \| d-popcorn \| v-cooking \| x-and-then \| z-←person-x-x \| v-sit \| [h-around \| b-fire] \| x-and-then \| z-←person-x-x \| d-←popcorn \| v-eat] | covered |
| 130 | They won the first two games, but lost the last one. | `zobelx thevom dezehamx g#1 al g#2 veverel. xegahum zoberx dezeham g#-1 vayorum.` | z-person-x \| th-MEMORY \| [d-contest-x \| g-1st.short] \| through \| g-2nd.short \| v-victory . x-but \| z-←person-x-x \| [d-contest \| g-1st-from-end.short] \| v-loss | covered |
| 131 | Take this note, carry it to your mother; and wait for an answer. | `yel dumegom om bamun vulabal oel bobel gavegol grebuwol behon xal vubahom dezeyem.` | y-command \| [d-message \| [near \| b-speaker] \| v-carry \| [toward \| [b-person \| g-female \| [g-#-e-1 \| b-listener]]] \| x-and \| v-wait \| d-discourse] | covered |
| 132 | I awoke early, dressed hastily, and went down to breakfast. | `zamun thobam zuel bral thevom vabuhel xan zamun hedarem vedebal xan zamun vevubel hadahel oel benodal gederom.` | [[z-speaker \| th-PATTERN \| z-rank/less \| b-later] \| th-MEMORY \| v-up \| x-and-then \| z-speaker \| h-haste \| v-dress \| x-and-then \| z-speaker \| v-go \| h-down \| [toward \| [b-bento \| g-dawn]]] | covered |
| 133 | Aha! I have caught you! | `!yulalun. zamun hamom dehon vumawul.` | !y-Ulalun . z-speaker \| h-RESIDUE \| d-listener \| v-mousetrap | covered |
| 134 | This string is too short! | `! zevelar om bamun thegatham zuel gerevam.` | [[! \| z-←thread \| [near \| b-speaker]] \| th-sake-met-any-term \| z-rank/less \| g-length] | covered |
| 135 | Oh, dear! the wind has blown my hat away! | `!yewomun. zewolor hamom danabol em bamun vewololum.` | !y-Ewomun . z-←wind \| h-RESIDUE \| d-sun-hat \| [used-by \| b-speaker] \| v-wind-recede | covered |
| 136 | Alas! that news is sad indeed! | `!yugamun. zunugar wanathumam gobum.` | !y-Ugamun . z-←newspaper \| [w-relatedness-unmet-modifiable-INTERNAL-FLOWING \| g-stimulus] | covered |
| 137 | Whew! that cold wind freezes my nose! | `!yuvumon. zewolor gogumol donobol gobom bamun vazulol.` | !y-Uvumon . [z-←wind \| g-cold] \| [d-nose \| [g-part-of \| b-speaker]] \| v-ice | covered |
| 138 | Are you warm enough now? | `yol ? zehon thegatham zoel guhamol thahom balarum grazol.` | y-question \| [? \| z-listener \| th-sake-met-any-term \| z-equal-rank \| g-hot] \| [th-INTUITION \| [b-hour \| g-zero]] | covered |
| 139 | They heard the warning too late. | `zobelx thegatham zel bral thevom dawogul vewal.` | [z-person-x \| th-sake-met-any-term \| z-rank/more \| b-later] \| th-MEMORY \| d-warning \| v-hear | covered |
| 140 | We are a brave people, and love our country. | `zamunx golozum xal zamunx dagul em bamunx velamal.` | [z-speaker-x \| g-courage \| x-and \| z-speaker-x \| d-country \| [used-by \| b-speaker-x] \| v-love] | covered |
| 141 | All the children came except Mary. | `zual gahayol ul zolozun thevom vevurol.` | [z-everything \| g-child] \| except \| z-Olozun \| th-MEMORY \| v-arrival | covered |
| 142 | Jack seized a handful of pebbles and threw them into the lake. | `zehalon thevom dahebol gahem baralolx gumazom vevebol xan zehalor daralorx vumovol al boguvem.` | [z-Ehalon \| th-MEMORY \| [d-hand \| [g-contents \| [b-rock-x \| g-small]]] \| v-fist \| x-and-then \| z-←Ehalon \| d-←rock-x-x \| v-throw \| [in \| b-lake]] | covered |
| 143 | This cottage stood on a low hill, at some distance from the village. | `zogahor thavom vonevol aol bumahol gumazom um bahuhom.` | z-←cottage \| th-NOTIONAL \| v-stand \| [on \| [b-mountain \| g-small]] \| [away-from \| b-locality] | covered |
| 144 | On a fine summer evening, the two old people were sitting outside the door of their cottage. | `ol badarul gehalom guwem bazadom zobelx gradul galayem thavom vehuhol ol boyel gobom bogahol em boberx.` | [at \| [b-dusk \| g-beauty \| [g-while \| b-summer]]] \| [z-person-x \| g-two \| g-elderhood] \| th-NOTIONAL \| v-sit \| [at \| [b-door \| [g-part-of \| b-cottage]]] \| [used-by \| b-←person-x-x] | covered |
| 145 | Our bird's name is Jacko. | `zobezol em bamunx. zobezor gugol behalon.` | z-bird \| [used-by \| b-speaker-x] . z-←bird \| [g-SAME \| b-Ehalon] | covered |
| 146 | The river knows the way to the sea. | `zowolar dorohel oel bohelal vugum.` | z-←drinking-water \| d-road \| [toward \| b-ocean] \| v-knowledge | covered |
| 147 | The boat sails away, like a bird on the wing. | `zobovar thodom vobovalum humum bobezol gaxuwebol.` | z-←boat \| th-LIVE \| v-boat-recede \| [h-like \| [b-bird \| g-agent-x-wing]] | covered |
| 148 | They looked cautiously about, but saw nothing. | `zobelx thevom huyelom vazebom ol bual. xegahum zoberx dal vanobol.` | z-person-x \| th-MEMORY \| h-caution \| v-look \| [at \| b-everything] . x-but \| z-←person-x-x \| d-none \| v-see | covered |
| 149 | The little house had three rooms, a sitting room, a bedroom, and a tiny kitchen. | `zexehuhol zexuzevol zexugudol weluzom gumazom zal gobom bawuhor gumazom thevom.` | [z-scene-x-chair \| z-scene-x-sleep \| [z-scene-x-cooking \| [w-very \| g-small]] \| z-and \| [g-part-of \| [b-←house \| g-small]]] \| th-MEMORY | covered |
| 150 | We visited my uncle's village, the largest village in the world. | `zamunx thevom dahuhom em bobel gemegol grebazol bobel grebuwol bamun voworelol. zahuhor zel geluzom al bogegol.` | z-speaker-x \| th-MEMORY \| d-locality \| [used-by \| [b-person \| g-male \| [g-#-e0 \| [b-person \| [g-#-e-1 \| b-speaker]]]]] \| v-attend . [z-←locality \| z-rank/more \| g-big] \| [in \| b-globe] | covered |
| 151 | We learn something new each day. | `zamunx voleyol dar gunugam hrawol hruwol bozarom.` | z-speaker-x \| v-learn \| [d-something \| g-news] \| h-one \| [h-divided-by-one \| b-day] | covered |
| 152 | The market begins five minutes earlier this week. | `zudeham thobam zuel bral bomerem g+5 vuyagel huwem bagarer om bamun.` | [z-market \| th-PATTERN \| z-rank/less \| b-later] \| [b-minute \| g-five.short] \| v-begin \| [h-while \| [b-←calendar \| [near \| b-speaker]]] | covered |
| 153 | Did you find the distance too great? | `yol ? zerevam thegatham behon zel geluzom thevom.` | y-question \| [? \| z-length \| [th-sake-met-any-term \| b-listener] \| z-rank/more \| g-big] \| th-MEMORY | covered |
| 154 | Hurry, children. | `yahayolx. yel vedarem.` | y-child-x . y-command \| v-haste | covered |
| 155 | Madam, I will obey your command. | `yehon. zamun thamam vehezam dehon.` | y-listener . z-speaker \| th-plan-itinerary \| v-conformity \| d-listener | covered |
| 156 | Here under this tree they gave their guests a splendid feast. | `zobelx thevom om bamun hadahel bodelor vebel bobelx ganadom boberx denodal gezum.` | z-person-x \| th-MEMORY \| [near \| b-speaker] \| [h-down \| b-←tree] \| v-present \| [b-person-x \| [g-hospitality \| b-←person-x-x]] \| [d-bento \| g-amazement] | covered |
| 157 | In winter I get up at night, and dress by yellow candlelight. | `zamun huam huwem bugabam vabuhel huwem banurol xal zamun vedebal ael bagawol guyelol.` | [z-speaker \| h-always.open \| [h-while \| b-winter] \| v-up \| [h-while \| b-night] \| x-and \| z-speaker \| v-dress \| [using \| [b-candle \| g-yellow]]] | covered |
| 158 | Tell the last part of that story again. | `yel huregem devehum gobom bozem vezeyel.` | y-command \| h-again \| [d-terminus \| [g-part-of \| b-tale]] \| v-tell | covered |
| 159 | Be quick or you will be too late. | `yel gedarem xol zehon thegatham zel bral vevurol.` | y-command \| [g-haste \| x-or-exactly-one \| [z-listener \| th-sake-met-any-term \| z-rank/more \| b-later] \| v-arrival] | covered |
| 160 | Will you go with us or wait here? | `yol ? zehon thamam han bamunx vevubel xol zehon thamam vubahom om bamun.` | y-question \| [? \| z-listener \| th-plan-itinerary \| [h-including \| b-speaker-x] \| v-go \| x-or-exactly-one \| z-listener \| th-plan-itinerary \| v-wait \| [near \| b-speaker]] | covered |
| 161 | She was always, shabby, often ragged, and on cold days very uncomfortable. | `zolozun thevom hual gulahum. zolozun thobam zel hral weluzom gulahum thevom. zolozun thevom weluzom gehayam gul huwem bozaromx gogumol.` | z-Olozun \| th-MEMORY \| h-always-except \| g-breakdown . [z-Olozun \| th-PATTERN \| z-rank/more \| h-how-often] \| [w-very \| g-breakdown] \| th-MEMORY . z-Olozun \| th-MEMORY \| [[w-very \| g-comfort] \| g-not] \| [h-while \| [b-day-x \| g-cold]] | covered |
| 162 | Think first and then act. | `yel vovemol xan vezebom.` | y-command \| [v-think \| x-and-then \| v-effort] | covered |
| 163 | I stood, a little mite of a girl, upon a chair by the window, and watched the falling snowflakes. | `zamun th(zamur gegeyol gumazom) thevom vonevol aol behuhol om bewehol xal zamun thevom vazebom duzololx gaxadahel.` | [z-speaker \| th-ASIDE[z-←speaker \| g-girl \| g-small] \| th-MEMORY \| v-stand \| [on \| b-chair] \| [near \| b-window] \| x-and \| z-speaker \| th-MEMORY \| v-look \| [d-snowflake-x \| g-agent-x-down]] | covered |
| 164 | Show the guests these shells, my son, and tell them their strange history. | `yehon. yel zobelx ganadom bamun dohebalx om bamun vanobol thegem behon. yel boberx dozem geleyom em boberx vezeyel.` | y-listener . y-command \| [z-person-x \| [g-hospitality \| b-speaker]] \| d-shell-x \| [near \| b-speaker] \| v-see \| [th-CAUSE \| b-listener] . y-command \| b-←person-x-x \| [d-tale \| g-strangeness] \| [used-by \| b-←person-x-x] \| v-tell | covered |
| 165 | Be satisfied with nothing but your best. | `yel guremom ol bezebom em behon bal.` | y-command \| g-calm \| [at \| [[b-effort \| [used-by \| b-listener]] \| b-and]] | covered |
| 166 | We consider them our faithful friends. | `zamunx vovemol darl zoberx godozom gameyom bamunx.` | z-speaker-x \| v-think \| d-that-clause \| [z-←person-x \| g-loyalty \| [g-companionship \| b-speaker-x]] | covered |
| 167 | We will make this place our home. | `zamunx thamam dahuhom om bamun vemayal el bawuhom em bamunx.` | z-speaker-x \| th-plan-itinerary \| d-locality \| [near \| b-speaker] \| v-manufacture \| [for \| b-home] \| [used-by \| b-speaker-x] | covered |
| 168 | The squirrels make their nests warm and snug with soft moss and leaves. | `zuzazalx huam denelalx wadewom guhamol gehayam em buzazar ael bebolal belalol bal vemayal.` | z-chipmunk-x \| h-always.open \| [d-nest-x \| [w-quite \| g-hot] \| g-comfort] \| [used-by \| b-←chipmunk-x] \| [using \| [b-herb \| b-leaf \| b-and]] \| v-manufacture | covered |
| 169 | The little girl made the doll's dress herself. | `zegeyol gumazom zal thevom dedebal em baneval vemayal.` | [[z-girl \| g-small] \| z-and] \| th-MEMORY \| d-dress \| [used-by \| b-nesting-doll] \| v-manufacture | covered |
| 170 | I hurt myself. | `zamun damur venumum.` | z-speaker \| d-←speaker \| v-harm | covered |
| 171 | She was talking to herself. | `zolozun thevom bolozur vezeyel.` | z-Olozun \| [th-MEMORY \| b-←Olozun] \| v-tell | covered |
| 172 | He proved himself trustworthy. | `zuzazon thevom duzazor gugewom vurugem.` | z-Uzazon \| th-MEMORY \| [d-←Uzazon \| g-trust] \| v-proof | covered |
| 173 | We could see ourselves in the water. | `zamunx thevom damurx vanobol al bowolal.` | z-speaker-x \| th-MEMORY \| d-←speaker-x-x \| v-see \| [in \| b-drinking-water] | covered |
| 174 | Do it yourself. | `yel zehon zal vezebom.` | y-command \| [z-listener \| z-and] \| v-effort | covered |
| 175 | I feel ashamed of myself. | `zamun thanathumom bamur.` | z-speaker \| [th-relatedness-unmet-modifiable-AIMED-FLOWING \| b-←speaker] | covered |
| 176 | Sit here by yourself. | `yel zehon zal vehuhol om bamun.` | y-command \| [z-listener \| z-and] \| v-sit \| [near \| b-speaker] | covered |
| 177 | The dress of the little princess was embroidered with roses, the national flower of the Country. | `dedebal em begeyol gumazom gegebem venewul ael borololx. zorolorx govalol gobom bagul.` | d-dress \| [used-by \| [b-girl \| g-small \| g-leadership]] \| v-needle \| [using \| b-rose-x] . [z-←rose-x-x \| g-flower \| [g-part-of \| b-country]] | covered |
| 178 | They wore red caps, the symbol of liberty. | `zobelx thevom dahobolx gerolol vedebal. zahoborx guzegal gohagem buzahom.` | z-person-x \| th-MEMORY \| [d-hat-x \| g-red] \| v-dress . [z-←hat-x-x \| g-symbols \| [g-topic \| b-liberty]] | covered |
| 179 | With him as our protector, we fear no danger. | `han buzazon gayoyul em bamunx zamunx dugobum dul vevumul.` | [h-including \| [b-Uzazon \| g-guard]] \| [used-by \| b-speaker-x] \| z-speaker-x \| [d-danger \| d-not] \| v-fear | covered |
| 180 | All her finery, lace, ribbons, and feathers, was packed away in a trunk. | `dual gurebom em bolozun vulabal al bulabal.` | [d-everything \| g-embellishment] \| [used-by \| b-Olozun] \| v-carry \| [in \| b-luggage] | covered |
| 181 | Light he thought her, like a feather. | `zuzazon vovemol darl zolozun thegatham zuel garalom humum bavebol.` | z-Uzazon \| v-think \| d-that-clause \| [z-Olozun \| th-sake-met-any-term \| z-rank/less \| g-heavy] \| [h-like \| b-feather] | covered |
| 182 | Every spring and fall our cousins pay us a long visit. | `zobelx grebawol bobel grebazol bobel grebuwol bamunx huam huwem bual guhalom xal huwem bual guvalum hadarem damunx voworelol.` | [[z-person-x \| [g-#-e1 \| [b-person \| [g-#-e0 \| [b-person \| [g-#-e-1 \| b-speaker-x]]]]]] \| h-always.open \| h-while \| [b-everything \| g-spring] \| x-and \| h-while \| [b-everything \| g-autumn] \| h-duration \| d-speaker-x \| v-attend] | covered |
| 183 | In our climate the grass remains green all winter. | `zual gogudal gegol hagem huwem bugabam am bugalum em bamunx.` | [z-everything \| g-greens] \| g-green \| h-still \| [h-while \| b-winter] \| [amid \| b-weather] \| [used-by \| b-speaker-x] | covered |
| 184 | The boy who brought the book has gone. | `zoboyol thevom dugul vulabal. zoboyor hamom vevubelum.` | z-boy \| th-MEMORY \| d-book \| v-carry . z-←boy \| h-RESIDUE \| v-go-recede | covered |
| 185 | These are the flowers that you ordered. | `zehon thevom dovalolx vagawam. zovalorx om bamun thodom.` | z-listener \| th-MEMORY \| d-flower-x \| v-consumption . z-←flower-x-x \| [near \| b-speaker] \| th-LIVE | covered |
| 186 | I have lost the book that you gave me. | `zehon thevom dugul bamun vebel. zamun hamom dugur vayorum.` | z-listener \| th-MEMORY \| d-book \| b-speaker \| v-present . z-speaker \| h-RESIDUE \| d-←book \| v-loss | covered |
| 187 | The fisherman who owned the boat now demanded payment. | `zaxevezal thevom doboval vagogom. zaxagogor thodom vern derl damol vebel.` | z-agent-x-fish \| th-MEMORY \| d-boat \| v-ownership . z-←agent-x-ownership \| th-LIVE \| v-command \| d-to-clause \| d-money \| v-present | covered |
| 188 | Come when you are called. | `yel vevubel oel bamun huwem barl dehon vohorom.` | y-command \| v-go \| [toward \| b-speaker] \| [h-while \| b-that-clause] \| d-listener \| v-summons | covered |
| 189 | I shall stay at home if it rains. | `zamun thamam vawuhom thoyem barl vurelal.` | z-speaker \| th-plan-itinerary \| v-home \| [th-if \| b-that-clause] \| v-rain | covered |
| 190 | When he saw me, he stopped. | `zuzazon thevom vuzahul huwem barl zuzazon thevom damun vanobol.` | z-Uzazon \| th-MEMORY \| v-stop \| [h-while \| b-that-clause] \| z-Uzazon \| th-MEMORY \| d-speaker \| v-see | covered |
| 191 | Do not laugh at me because I seem so absent minded. | `yul valamal ol bamun thavem barl zamun thunemehon gazebom gul.` | y-prohibition \| v-laugh \| [at \| b-speaker] \| [th-because \| b-that-clause] \| z-speaker \| th-CLUES-listener \| [g-attention \| g-not] | covered |
| 192 | I shall lend you the books that you need. | `zehon thodom dugulx volum. zamun thamam dugurx dehon vagarol.` | z-listener \| th-LIVE \| d-book-x \| v-necessity . z-speaker \| th-plan-itinerary \| d-←book-x \| d-listener \| v-lend | covered |
| 193 | Come early next Monday if you can. | `yel zehon thobam zuel bral vevubel oel bamun huwem bolarem grewol thoyem barl zehon vevubexal.` | y-command \| [z-listener \| th-PATTERN \| z-rank/less \| b-later] \| v-go \| [toward \| b-speaker] \| [h-while \| [b-weekday \| g-1st]] \| [th-if \| b-that-clause] \| z-listener \| v-go-able | covered |
| 194 | If you come early, wait in the hall. | `yel vubahom al bexoworel thoyem barl zehon thobam zuel bral vevubel.` | y-command \| v-wait \| [in \| b-scene-x-walk] \| [th-if \| b-that-clause] \| [z-listener \| th-PATTERN \| z-rank/less \| b-later] \| v-go | covered |
| 195 | I had a younger brother whose name was Antonio. | `zehalon thevom glemegol grebazol bamun. zehalon zamun zuel goberom.` | z-Ehalon \| th-MEMORY \| gl-male \| [g-#-e0 \| b-speaker] . [z-Ehalon \| z-speaker \| z-rank/less \| g-age] | covered |
| 196 | Gnomes are little men who live under the ground. | `glemegol zobelx gumazom huam vawuhom hadahel bunolal.` | [gl-male \| z-person-x \| g-small] \| h-always.open \| v-home \| [h-down \| b-ground] | covered |
| 197 | He is loved by everybody, because he has a gentle disposition. | `zual gobel duzazon velamal thavem barl zuzazon gogemam.` | [z-everything \| g-person] \| d-Uzazon \| v-love \| [th-because \| b-that-clause] \| [z-Uzazon \| g-kindness] | covered |
| 198 | Hold the horse while I run and get my cap. | `yel dohozol vevebol. huwem barl zamun varuvel dahobol em bamun vulabal val.` | y-command \| d-horse \| v-fist . [h-while \| b-that-clause] \| z-speaker \| v-run \| d-cap \| [used-by \| b-speaker] \| [v-carry \| v-and] | covered |
| 199 | I have found the ring I lost. | `zamun thevom durubol vayorum. zamun hamom durubor vemawol.` | z-speaker \| th-MEMORY \| d-ring \| v-loss . z-speaker \| h-RESIDUE \| d-←ring \| v-find | covered |
| 200 | Play and I will sing. | `yel vubuham. xan zamun thamam vezeyol.` | y-command \| v-play . x-and-then \| z-speaker \| th-plan-itinerary \| v-sing | covered |
| 201 | That is the funniest story I ever heard. | `zamun hoham thevom dozemx vewam. zozer zel galamam.` | z-speaker \| h-already \| th-MEMORY \| d-tale-x \| v-listening . [z-←scroll \| z-rank/more \| g-amusement] | covered |
| 202 | She is taller than her brother. | `zolozun glemegol zobel grebazol bolozun zel gadahom.` | z-Olozun \| gl-male \| z-person \| g-#-e0 \| b-Olozun \| z-rank/more \| g-height | covered |
| 203 | They are no wiser than we. | `zuzazonx zamunx zuel geleyem.` | [z-Uzazon-x \| z-speaker-x \| z-rank/less \| g-wisdom] | covered |
| 204 | Light travels faster than sound. | `zoyolol zogawom zel hedarem vevubel.` | [z-bright \| z-volume \| z-rank/more \| h-haste] \| v-go | covered |
| 205 | We have more time than they. | `zamunx zuzazonx zel gral dadarel vagogom.` | [z-speaker-x \| z-Uzazon-x \| z-rank/more \| g-amount] \| d-time \| v-ownership | covered |
| 206 | She has more friends than enemies. | `zanalobelx em bolozun zobelx gavavum em bolozun zel gral.` | z-friend-x \| [used-by \| b-Olozun] \| [[z-person-x \| g-struggle \| [used-by \| b-Olozun]] \| z-rank/more \| g-amount] | covered |
| 207 | He was very poor, and with his wife and five children lived in a little low cabin of logs and stones. | `zuzazon thobam zuel wohelal gral thevom damol vagogom. zuzazon thevom vawuhom han bobel gavegol gohoyam buzazon han bahayolx g+5 al bahuhol gumazom huwum buwul baralol bal.` | [z-Uzazon \| th-PATTERN \| z-rank/less \| [w-ocean \| g-amount]] \| th-MEMORY \| d-money \| v-ownership . z-Uzazon \| th-MEMORY \| v-home \| [h-including \| [b-person \| g-female \| [g-partnership \| b-Uzazon]]] \| [h-including \| [b-child-x \| g-five.short]] \| [in \| [b-hut \| g-small]] \| [h-material \| [b-wood \| b-rock \| b-and]] | covered |
| 208 | When the wind blew, the traveler wrapped his mantle more closely around him. | `zaxoworel thobam zel hehayam thevom dogobal em baxoworer vebedum hugem baxoworer. huwem barl zewolol thevom vewolol.` | [z-agent-x-walk \| th-PATTERN \| z-rank/more \| h-comfort] \| th-MEMORY \| [d-coat \| [used-by \| b-←agent-x-agent-x-walk]] \| v-encapsulation \| [h-around \| b-←agent-x-agent-x-walk] . [h-while \| b-that-clause] \| z-wind \| th-MEMORY \| v-wind | covered |
| 209 | I am sure that we can go. | `zamunx thunel vevubexal.` | z-speaker-x \| th-CLUES.strong \| v-go-able | covered |
| 210 | We went back to the place where we saw the roses. | `zamunx thevom dorololx vanobol ol bahuhom. zamunx thevom vevubel hobahel oel bahuhor.` | z-speaker-x \| th-MEMORY \| d-rose-x \| v-see \| [at \| b-locality] . z-speaker-x \| th-MEMORY \| v-go \| h-back \| [toward \| b-←hut] | covered |
| 211 | "This tree is fifty feet high," said the gardener. | `zaxubalol thevom d[zodelol gadahom bezerem g+15 om bamun] vezeyel.` | z-agent-x-house-plant \| th-MEMORY \| d-CITE[[z-tree \| [g-height \| [b-meter \| g-15]]] \| [near \| b-speaker]] \| v-tell | covered |
| 212 | I think that this train leaves five minutes earlier today. | `zamun vovemol darl zodevel om bamun thobam zuel bral bomerem g+5 huwem bozarom om bamun vevubelum.` | z-speaker \| v-think \| d-that-clause \| [[z-train \| [near \| b-speaker]] \| th-PATTERN \| z-rank/less \| b-later] \| [b-minute \| g-five.short] \| [h-while \| [b-day \| [near \| b-speaker]]] \| v-go-recede | covered |
| 213 | My opinion is that the governor will grant him a pardon. | `zamun vovemol darl zaxegebel thunem bral duzazon vebegom.` | z-speaker \| v-think \| d-that-clause \| z-agent-x-crown \| [th-CLUES \| b-later] \| d-Uzazon \| v-forgiveness | covered |
| 214 | Why he has left the city is a mystery. | `vemeyom dorl zuzazon hamom vevubelum ul bazohol thavem bar.` | v-mystery \| d-whether-clause \| z-Uzazon \| h-RESIDUE \| v-go-recede \| [from \| b-skyline] \| th-because \| b-something | covered |
| 215 | The house stands where three roads meet. | `zorohelx g+3 vuyehom. zawuhol thodom vonevol al buyehor.` | [z-road-x \| g-three.short] \| v-hub . z-house \| th-LIVE \| v-stand \| [in \| b-←station] | covered |
| 216 | He has far more money than brains. | `zamol em buzazon zewebom em buzazon zel wohelal gral.` | z-money \| [used-by \| b-Uzazon] \| [[z-intellect \| [used-by \| b-Uzazon]] \| z-rank/more \| [w-ocean \| g-more-than-one]] | covered |
| 217 | Evidently that gate is never opened, for the long grass and the great hemlocks grow close against it. | `zoyel thunel voyel hal thavem barl zogudal gerevam zodelolx geluzom zal vuzem om boyer.` | z-door \| th-CLUES.strong \| v-open \| h-never \| [th-because \| b-that-clause] \| [[z-greens \| g-length] \| [z-tree-x \| g-big] \| z-and] \| v-growth \| [near \| b-←open] | covered |
| 218 | I met a little cottage girl; she was eight years old, she said. | `zamun thevom degeyol gumazom gogahom vuyehom. zegeyor thevom d~[zegeyor buvevam g+8 goberom] vezeyel.` | z-speaker \| th-MEMORY \| [d-girl \| g-small \| g-rural] \| v-hub . z-←girl \| th-MEMORY \| d-CITE.about[z-←girl \| [b-year \| g-eight.short \| g-age]] \| v-tell | covered |

### Notes

- **STC-1–10, *the sun*:** a full-root resume `zuzalor` with no antecedent is *the one we both know*, which fits a unique referent. No article gap.
- **STC-1:** read as a plain report. A general truth (*the sun shines, as a rule*) would add *always* `hual`.
- **STC-2–7, tense:** by design (no tense letter). The progressive is LIVE, the past is MEMORY, and the future is a channel + `bral`. *Tomorrow* is the day offset +1 on that channel. Each forecast has to choose a warrant; PATTERN is the honest one for sunrise.
- **STC-5, *has been shining*:** *still* `hagem` carries "began earlier, goes on now". The English duration-up-to-now is only implied; a measured duration would need a measure phrase.
- **STC-10, *now*:** LIVE already means "in view now" and takes no zero offset, so there is no separate *now* word.
- **STC-8:** with `v:shine` on *bright*, `hoyolol voyolol` reads *shines brightly*, like the English.
- **STC-11–13, *the people*:** `zual gobel` with no place hook is every person the situation is about. *Some of* / *many of* resume the known group (`zoberx`) and give the amount, per the denominator recipe; *many* names the Typical bar.
- **STC-15–20, *kitten*:** a live compound, *baby* `x` *cat* (`ebebexagada`); later mentions resume it in full.
- **STC-17, 26, 31, 33, *away*:** hook compound with `um` (*recede*) on the motion verb: `voworelum`, `vevubelum`, `vewevolum`, `vememulum`.
- **STC-19, 21:** *came down* is *fall*; *has stopped* is *no longer* `hewem` (the rain no longer falls), so no *stop* verb is needed.
- **STC-24, *once*:** FORMER `henom` (a past climate, not today's). *Here* is `om bamun`.
- **STC-28, *should*:** prescription with the unnamed sake, `thegathem`. **STC-37, *must*:** `thumem`.
- **STC-29, *happy to*:** emotion compose on `/th/`: pleasure met, INTERNAL, FLOWING (`thozothamam`) — the speaker's own feeling, so no holder is needed.
- **STC-33, *probably*:** stance number `thral` (*likely*, no figure).
- **STC-38, *opposite*:** `honahethahan` — in front, as the two of us face. *Directly* is dropped.
- **STC-45, *village*:** *hut* in its abstract sense, `bahuhom` (*locality*). *For a visit* is `hogom` + the *attend* compound as a noun.
- **STC-47, *wait for you*:** the awaited person is the object.
- **STC-50, *her father*:** kin number `grebuwol` (the layer above) + `/b/` the child, with *male* before it. Long, but every piece is taught.
- **STC-51, *oldest girl in the village*:** superlative `zegeyol zel goberom`; the group in play is set by the clause-level *in the village* hook. *Yesterday* is the day offset −1 on MEMORY.
- **STC-52–56, 59, 73, 97, 99, questions:** no channel under `yol` where *did* / *are … coming* read from the bare verb. A question about intent takes PLAN (STC-56 *can you come tomorrow*). A forecast in a question puts a channel under `yol`, which asks for the listener's warrant (STC-73, 97: CLUES + `bral`). *Ready* in STC-97 is the verb *prepare* (`vabam`), since `gabam` is *before*.
- **STC-52, *this village*:** `al bahuhom om bamun`: a hook + `/b/` right after a landmark describes it (*the village near me*).
- **STC-53, 55, *your brother / sister*:** sibling kin `grebazol` + `/b/` listener, with *male* / *female* before. **STC-89, 93, *father*, *his boy*:** `grebuwol` / `grebawol` on the kin anchor.
- **STC-57, *neighbors*:** agent compound on *home* (`zaxawuhomx`) + *near us*. *Gone away* keeps RESIDUE (they are still away). *Winter* is the *gloves* abstract (`bugabam`).
- **STC-58, 91, *robin*:** compound *red* `x` *bird* (`eredaxebedu`); the habit question is an open universal `zuam`.
- **STC-59, *concert*:** scene compound on *sing* (`bexezeyol`, a sing-event). *With us* (not the listener) is `han bamunx`. **STC-63, 72, 92:** narrative *we* that leaves the listener out is `zamunx`, not `zahan`.
- **STC-60, *ever*:** `hoham … har`. *Travel* is `vehevam` (*voyage*). *Jungle* is the compound *palm* `x` *tree* (`baboloxodelolx`).
- **STC-61, *several miles*:** metric, not miles: `bezerem grabarem` (*thousands of meters*, about). *Down* the river is dropped.
- **STC-62, *knows*:** the *book* abstract as a verb (`vugum`); *about* is `hohagem`. *Everybody* is open `zuam` (as far as I know). *Hunting* stays *predation* (`bawuzum`); the verb *hunt* is `varevel`, role English on *archery*.
- **STC-63, *solstice*:** compound *sun* `x` *stop* (`buzaloxuzahul`). *Started for* is the hook compound *go* + *toward* (`vevubeloel`).
- **STC-63, 71, 74, 76:** fronted place phrases (`aol bumahol …`, `am begulal …`) now parse as extra-noun hooks (parser fix; see results).
- **STC-64, *the monkey's tricks*:** two sentences, then an event resume (`bedeyur`), the recipe for an act as someone's (say-people-places.md § someone's act).
- **STC-66, *was hidden by*:** object first, then the hider as subject. *Boughs* is *tree* `x` *bone* (`zodeloxobolx`).
- **STC-67, *spring sun*:** the time pole on the noun, `guwem buhalom` (*during spring*).
- **STC-68, *wreaths … on their heads*:** *wreath* is the compound `bovalolegebelx`. *On their heads* is dropped: a hook + `/b/` after the wreath (`aol behabolx`) would split the *many* rank from its noun. *Head* is `behabol`.
- **STC-70, *in the line*:** dropped; the ordinal already says the order.
- **STC-71, *lived*:** NOTIONAL `thavom`, since this is story narration; later sentences of the tale carry it forward.
- **STC-73, *your guests*:** people cannot take `em`, so *guests* is the *hospitality* tie (`ganadom behon`); *from the city* goes before the noun with `gl-`, since two relation adjectives cannot follow one noun.
- **STC-74, *sharply*:** `honawum` (*severity*, the knife abstract). *Course turns* is `voregom` (*turn*, the abstract on *refresh*).
- **STC-75, 76, 78, 79:** an `/h/`-hosted `/b/` now keeps its adjectives (`hazam bumaholx gradul gadahom`, `humum bomuyol gozumam`; parser fix).
- **STC-82, 94, *happy*:** emotion compose, pleasure met, INTERNAL, FLOWING (`thozothamam`). Someone else's feeling takes a holder (STC-88 `thunemegeyor`, STC-94 `thodomoberx`); a holder can be a full-root resume, and a group takes **-x** (*those people*).
- **STC-83, *these oranges*:** full-root resume (the ones we both see) plus *near me*; a new noun would read as *there are juicy oranges here*.
- **STC-84, *sea water is salty*:** `zuam` + kind + `/ɡ/` is a property of every member, as a rule (exceptions not listed).
- **STC-85, *full of people*:** approximated as *many people in the streets* (Typical bar). *Streets* is *road* (`borohelx`).
- **STC-86, 87, *tastes / feels*:** the sense is the channel: LIVE for a present touch, PATTERN for a general taste. *Sugar* is the *candy* abstract (`gagadam`).
- **STC-89, *had once been*:** FORMER `henom`. The predicate *sailor* sits between the noun and the kin relation, so it describes the father, not the boy.
- **STC-95, *Monday*:** *first weekday* (`zolarem grewol`, counting from Monday) under LIVE for *today*.
- **STC-65, 69, 72, 76, 77, 79, 80, 144, new words:** *fence* `buwulegahul`, *floor* `bawuholunolal`, *field* `buvehalx`, *wheat* `begulal` (*grain*), *oak* `bunadulodelolx`, *ground* `bunolal`, *face* `buvemol`, *summer* `bazadom`.
- **STC-72, 79, 96, new rows:** *country* is `bogahom` (*rural*), *caress* is *hug* (`behayal`), *leaves* is `gelalol`.
- **STC-98, a polite request:** English *Will you … for me?* is a request, so it takes soft request `yem`; *for me* is proxy `hadem`.
- **STC-100, *first of the litter*:** eldest sibling `g#1e0`.
- **STC-101, 115, *these shoes* / *this tree*:** full-root resume only. `om bamun` before a rank join or a fill-ask list would make the next `/ɡ/` words describe the speaker (the landmark). *Too big for you* is the unspecified sake bar with the listener in its `/b/` as whose stake (`thegatham behon`).
- **STC-102, *how wide*:** `wrar` on *width* (`gagoram`, the *accordion* abstract).
- **STC-103–108, commands:** *listen* is the *ear* abstract as a verb (`vewam`), not *hear* (`vewal`). *Keep this secret* is *keep confidential* (`vehamum`, the *hush* abstract) with `darth` for *this*; *until tomorrow* is a signed day count in the pole's `/b/` (`homam bozarom grawol`), counted from now. *Be careful* is `yel guyelom`, a command with only a `/ɡ/` body. *Come* / *bring … with you* is `vevubel` + `han` (company); with a place, `oel bamun`.
- **STC-90, *blanket*:** the *yarn* abstract (`dayalam`). **STC-134, *too short*:** less *length* (`gerevam`, the *railcar* abstract). **STC-142, *threw … lake*:** `vumovol` (role English on *boomerang*) and `boguvem` (the *canoe* abstract).
- **STC-109, *have some tea*:** an offer, so soft request `yem`; `gral` on a mass noun is *some*. The verb is `vodedal` (*drink*).
- **STC-110, 111, *friends* / *brother and sister*:** the tie or kin word is SHARED after the join with no `/b/`, so *of each other* is only implied (G-17). *His dog* is a hook + `/b/` right before the join word (`zodozol em buzazor zal`, G-18).
- **STC-112, *go together*:** PLAN plus collective **-x** on the verb.
- **STC-113, *all the doors and windows*:** two *every K* clauses, since a kind join after `dual` does not read as one kind. *Open* is `voyel` (role English on *door*).
- **STC-114, 118, 130, 148, *but*:** the linker `xegahum` starts a second sentence. *Small but strong*, *tired but happy*: the first claim sets an expectation the second blocks.
- **STC-116, *the sky … look*:** *sky* (`zagolom`, the *cloud* abstract) and *gray* (`gegulol`); *look* is LIVE, as *feels* was in STC-87. The choice is a fill-ask over the two colors (`?gar`).
- **STC-117, 131, 150, kin:** *father or mother* is the parent layer with no mantissa (`grebuwol`, one member). *Uncle* is a male sibling of a parent. *Mother* is `gavegol` before the kin number.
- **STC-119, *played a tune on*:** *perform* (`vamum`) with the flute as a tool (`ael`); `em buzazor` follows the flute's adjective, as in hooks.md § Whose.
- **STC-120, *toward the end of August*:** *near 31 August* (`om b_#31,8`). *The days grow much shorter* is *much less duration than usual* on PATTERN.
- **STC-121, *company of soldiers marched*:** *guards* (💂) walking as one act (`voworelx`). The fronted *over the hill* keeps the two extras apart.
- **STC-122, *the first part of the story*:** *the beginning* (`zuyager`, a full-root resume), with *interesting* (*curiosity*) before the relation so it describes the beginning, not the story.
- **STC-123, *crow*, *pitcher*, *brim*:** *black* `x` *bird*, *amphora*, *the top part of it*. *Dropped* is *fall* with an object.
- **STC-124, *in glee*:** SHARED `/h/` after a verb join covers both verbs. The manner is observable, so no holder is needed.
- **STC-125, *stop … and be quiet*:** *no longer play* (`hewem vubuham`), then *be quiet* as a `/ɡ/`-only command clause (`guzomom`) in a clause join under the same command.
- **STC-126, *louder and louder*:** *rose in volume* (`hogawom varorel`, the uptrend verb).
- **STC-127, *better*:** `?der` asks which ranks first. *Summer* is the *ice-cream* abstract (`dazadom`).
- **STC-128, 139:** *will* is CLUES + `bral`; *too late* is a sake bar, `thegatham zel bral`.
- **STC-129, 132, 142:** a string of acts by one subject is `xan` with a resumed subject, since verb-join items cannot carry their own objects (G-19).
- **STC-133–137, interjections:** `/y/` + **-n** on the matching root: *aha* is *insight* (`yulalun`), *oh dear* is *worried* (`yewomun`), *alas* is *cry* (`yugamun`), *whew* is *phew* (`yuvumon`). *Indeed* and the English *!* are the `!` tone mark.
- **STC-136, *that news is sad*:** the speaker's feeling on a noun they do not own, so emotion compose on `/w/` + `gobum`.
- **STC-138, *warm enough now*:** the unspecified sake bar's tie on *hot*, and INTUITION with a zero offset asks what the listener's body says now.
- **STC-140, *a brave people*:** reduced to *we are brave*.
- **STC-143, 144:** story narration, so NOTIONAL. *Outside the door* is *at the door*.
- **STC-145, *our bird's name is Jacko*:** two sentences, since `gugol` after `em bamunx` would describe the speaker group.
- **STC-146, *the way to the sea*:** *road* with *toward the sea*.
- **STC-147, *on the wing*:** *flier* (agent compound on *wing*).
- **STC-149, *rooms*:** scene compounds on *chair*, *sleep*, and *cooking*. *Had three rooms* is an existence list SHARED as *part of the little house*; the count is the list.
- **STC-151, 182, *each day* / *every spring and fall*:** a counted unit is a count per unit (`hrawol hruwol bozarom`, once per day); named seasons are a universal kind in the time pole (`huwem bual guhalom`). *Something new* is `dar` (an unnamed new thing) plus *news* (`gunugam`).
- **STC-152, *market*, *minutes*, *this week*:** *market* is the new abstract on 🏬 (`zudeham`, L-09). *Minute* is the new stock unit `bomerem` (L-10). *This week* is the full-root resume `bagarer` plus `om bamun`, which describes the week ([hook + `/b/` on a landmark](../grammar/hooks.md)). *Earlier* is the `bral` scale against the *Usual* bar.
- **STC-153, *find … too great*:** *distance* is *length* (`zerevam`). MEMORY under `yol` asks for the listener's own warrant, as in STC-97.
- **STC-154, 155, 164, address:** *children* is a kind vocative with **-x** (`yahayolx`). *Madam* and *my son* are the listener (`yehon`); the title and the kin word are dropped.
- **STC-155, *obey*:** `vehezam` (the *conformity* abstract). *Command* is dropped; `vern` states a command as content, but here the act is the obeying.
- **STC-156, *here under this tree*:** `hadahel` + landmark is *under* (roles.md § gravity). *Feast* is a wonderful *bento* (`denodal gezum`), *gave* is `vebel` (*present*), and *their guests* is the *hospitality* tie with a resume (`bobelx ganadom boberx`).
- **STC-157, *in winter … at night*:** two `huwem` poles, with COMMON for the routine. *Candlelight* is *using a yellow candle* (`guyelol`); *get up* is `vabuhel` (*up*), *dress* is `vedebal`.
- **STC-158, *last part*:** *the end* (`devehum`, the *finish-line* abstract) of the tale, as in STC-122.
- **STC-159, 160, *or*:** `xol` between clauses. In 159 the second clause is the rank claim *later than needed* with the verb *arrive*, so the threat is the outcome, not a forecast.
- **STC-161, *shabby*, *ragged*, *uncomfortable*:** three claims. *Shabby* and *ragged* are *breakdown* (`gulahum`, as *broken* in STC-41), with `weluzom` on the second; *uncomfortable* is *not comfortable* (`gehayam gul`) placed before the *cold days* pole so the `/w/` word stays on the adjective.
- **STC-162, *think first and then act*:** verb join `xan` (*and then*). *Act* is *effort* (`vezebom`).
- **STC-163, *a little mite of a girl*:** an aside with a resume of the speaker (`th(zamur gegeyol gumazom)`). *Falling* is the agent compound on *down* (`gaxadahel`).
- **STC-164, *show … tell*:** *show* is CAUSE with the listener as causer (`thegem behon`): the guests are the subject of *see*. *History* is *tale*, and *strange* is the *alien* abstract (`geleyom`).
- **STC-165, *nothing but*:** the single-item **-l** join is *just* ([joins](../grammar/joins.md)): `ol bezebom em behon bal` is *at only your effort*. *Best* is *effort*.
- **STC-166, *consider … faithful friends*:** `darl` and a second sentence. *Faithful* is the *loyalty* abstract on *dog* (`godozom`).
- **STC-167, *make this place our home*:** *make* (`vemayal`) with `el` (*for*) and *home* (`bawuhom`, the *house* abstract), owned by us with `em`. *This place* is *locality* plus `om bamun`.
- **STC-168, *warm and snug … soft moss*:** *warm* is *quite hot* (`wadewom guhamol`), *snug* is *comfort*, *moss* is *herb* (`bebolal`); *soft* is dropped. The noun join `bal` closes *herb and leaf*, both under `ael`.
- **STC-169, 174, 176, *-self* as *unaided*:** the single-item **-l** join is *just* ([joins](../grammar/joins.md)): `zegeyol gumazom zal` is *only the little girl*, so nobody else did it. It also gives *alone* (STC-176).
- **STC-170, 171, 173, 175, reflexives:** a resume in the object or recipient slot points back at the subject ([pronouns](../grammar/pronouns.md#resume-r)). *Ashamed of myself* is unmet relatedness aimed at oneself (`thanathumom bamur`). **STC-172:** *proved* is the *proof* abstract as a verb (`vurugem`).
- **STC-177, *embroidered*, *princess*:** no subject, with *sew* from *needle* (`venewul`). *Princess* is *small girl* with *leadership* (`gegebem`). *National flower of the Country* is a second sentence: `gobom bagul` (*country*, 🗾).
- **STC-178, *symbol of liberty*:** *symbols* (`guzegal`) with *about* (`gohagem`) and the *liberty* abstract on *statue*.
- **STC-179, *with him as our protector*:** `han buzazon gayoyul em bamunx` (including Uzazon the guard). *No danger* is `dugobum dul`.
- **STC-180, *finery … packed*:** *finery* is *embellishment*; lace, ribbons, and feathers are dropped. *Trunk* is *luggage* (`bulabal`), *packed away* is *carry* (`vulabal`), and the subject is left out.
- **STC-181, *light … like a feather*:** `darl` and a second sentence. *Light* is *less heavy than the unspecified sake bar* (`thegatham zuel garalom`).
- **STC-182, *cousins*, *long visit*:** cousin is a child of a sibling of a parent: three kin anchors (`grebawol bobel grebazol bobel grebuwol bamunx`). *Long* is `hadarem`; *pay a visit* is *attend* with the visited as object.
- **STC-183, *climate*, *remains*:** `zual` + kind + `/ɡ/` is a property of every member (STC-84); *remains* is `hagem`; *climate* is *weather* (`bugalum`).
- **STC-184–187, relative clauses:** two sentences with a resume. *Brought* is *carry*; *ordered* is *consumption* (`vagawam`, from *cart*), so *bought*. **STC-187:** the fisherman's own event comes first (`vagogom`, *own*), then the doer resume `zaxagogor` ([roles](../grammar/roles.md#this-instance-r)), and *demanded payment* is `vern` with *money given*.
- **STC-188–190:** `huwem barl` is *when*, `thoyem barl` is *if*. *Stop* is `vuzahul`; *called* is *summoned* (`vohorom`).
- **STC-191, *seem*:** the holder seam names the listener (`thunemehon`, *as you see it*), so the speaker never states the impression as plain fact. *Absent-minded* is *not attentive* (`gazebom gul`).
- **STC-192, *lend*, *need*:** *lend* is role English on *credit-card* (`vagarol`); *need* is the *necessity* abstract as a verb (`volum`). Two sentences with a book resume.
- **STC-193, 194, *early*, *Monday*:** *early* is the PATTERN bar, `thobam zuel bral` (G-03); the bar needs a ranked item, so the listener is named; *next Monday* is the weekday ordinal under `huwem` (G-14). *Hall* is the scene compound on *walk* (`bexoworel`).
- **STC-195, *name was Antonio*:** the name is a house-cast name (`zehalon`), not a foreign payload. *Younger* is the rank on *age*, said as its own sentence.
- **STC-196, *gnomes*:** no gnome root; *little men* under `hadahel bunolal` (*down* on the ground), with COMMON for the habitual claim. *Under* has no hosted relation of its own.
- **STC-197, *loved by everybody*:** object first, then the lover as subject; *gentle* is *kindness* (`gogemam`) under the because pole.
- **STC-198, 199, *hold*, *find*:** *hold* is *seize* (`vevebol`); *find* is role English on *magnify* (`vemawol`, L-12). *Run and get my cap* is a verb list closed by `val` (G-19).
- **STC-201, *funniest*:** *hear* is the *listening* abstract; *story* is the *tale* abstract, and `zozer` is *that one* with the superlative bar.
- **STC-202, 206, 216, comparatives:** the second name is a full noun phrase (`glemegol zobel grebazol bolozun`). *Enemies* is *people of struggle* (`gavavum`). *Far more* is `wohelal` on the amount scale, as in comparatives.md.
- **STC-203, *no wiser than*:** the whole comparison denied with a **u** join (`zel gumahom zul`: below or tied), not reverse rank `zuel`, which is *not as … as* (comparatives.md § Intermediate; G-23). The English implication that neither is wise is not said.
- **STC-204, *faster*:** the manner scale, `hedarem` (*haste*). *Light* is `zoyolol` (*bright*); *sound* is *volume* (`zogawom`).
- **STC-207, *very poor*:** *far fewer than typical* on the amount of money owned. *Wife* is a female partner tie (`gohoyam`), and the two `han` hooks keep *his wife* and *five children* apart. *Cabin* is *little hut*; *low* is dropped; *of logs and stones* is `huwum` with a join.
- **STC-208, *mantle*, *closely*:** *mantle* is *coat*; *traveler* is the agent compound on *walk*. *More closely* is approximated as *more snugly* (`hehayam`), as in STC-168.
- **STC-209, *sure*:** a strong CLUES channel (`thunel`), the *-l* ending being solid evidence.
- **STC-210, 215, *the place where*:** name the place, then resume it in the next sentence (dependents.md § which noun). *Meet* is the *hub* abstract as a verb (`vuyehom`), and the road event is resumed as `buyehor`.
- **STC-211, *fifty feet*:** metric, `bezerem g+15` after the scale adjective, as in say-amounts.md. *Gardener* is the agent compound on *tending*. The quote is an exact cite.
- **STC-212, 213, *I think*:** `vovemol darl`. *My opinion is that* is said as *I think that*; *governor* is the agent compound on *leadership*, *pardon* is *forgive* (`vebegom`).
- **STC-214, *why he has left*:** a reported *why* is the `thavem bar` blank inside `dorl` ([reported questions](../grammar/say-questions.md#reported-questions)); *mystery* is the abstract as a verb (`vemeyom`) with that clause as its object, so the English subject clause becomes an object.
- **STC-217, *never*, *evidently*:** `hal` is the *never* restrictor; *evidently* is the strong CLUES channel. *Gate* is *door*, and `boyer` binds the door noun, though its nearest same-root word is the verb.
- **STC-218, *cottage girl*:** *little rural girl*; *she said* is a paraphrase cite (`d~[…]`) with the age as a measure on *year* (`buvevam g+8`).

Findings (stopping points) are logged in [syntax-test-results](syntax-test-results.md).

## Source list

1. The sun shines.
2. The sun is shining.
3. The sun shone.
4. The sun will shine.
5. The sun has been shining.
6. The sun is shining again.
7. The sun will shine tomorrow.
8. The sun shines brightly.
9. The bright sun shines.
10. The sun is rising now.
11. All the people shouted.
12. Some of the people shouted.
13. Many of the people shouted twice.
14. Happy people often shout.
15. The kitten jumped up.
16. The kitten jumped onto the table.
17. My little kitten walked away.
18. It's raining.
19. The rain came down.
20. The kitten is playing in the rain.
21. The rain has stopped.
22. Soon the rain will stop.
23. I hope the rain stops soon.
24. Once wild animals lived here.
25. Slowly she looked around.
26. Go away!
27. Let's go!
28. You should go.
29. I will be happy to go.
30. He will arrive soon.
31. The baby's ball has rolled away.
32. The two boys are working together.
33. This mist will probably clear away.
34. Lovely flowers are growing everywhere.
35. We should eat more slowly.
36. You have come too soon.
37. You must write more neatly.
38. Directly opposite stands a wonderful palace.
39. Henry's dog is lost.
40. My cat is black.
41. The little girl's doll is broken.
42. I usually sleep soundly.
43. The children ran after Jack.
44. I can play after school.
45. We went to the village for a visit.
46. We arrived at the river.
47. I have been waiting for you.
48. The campers sat around the fire.
49. A little girl with a kitten sat near me.
50. The child waited at the door for her father.
51. Yesterday the oldest girl in the village lost her kitten.
52. Were you born in this village?
53. Can your brother dance well?
54. Did the man leave?
55. Is your sister coming for you?
56. Can you come tomorrow?
57. Have the neighbors gone away for the winter?
58. Does the robin sing in the rain?
59. Are you going with us to the concert?
60. Have you ever travelled in the jungle?
61. We sailed down the river for several miles.
62. Everybody knows about hunting.
63. On a Sunny morning after the solstice we started for the mountains.
64. Tom laughed at the monkey's tricks.
65. An old man with a walking stick stood beside the fence.
66. The squirrel's nest was hidden by drooping boughs.
67. The little seeds waited patiently under the snow for the warm spring sun.
68. Many little girls with wreaths of flowers on their heads danced around the bonfire.
69. The cover of the basket fell to the floor.
70. The first boy in the line stopped at the entrance.
71. On the top of the hill in a little hut lived a wise old woman.
72. During our residence in the country we often walked in the pastures.
73. When will your guests from the city arrive?
74. Near the mouth of the river, its course turns sharply towards the East.
75. Between the two lofty mountains lay a fertile valley.
76. Among the wheat grew tall red poppies.
77. The strong roots of the oak trees were torn from the ground.
78. The sun looked down through the branches upon the children at play.
79. The west wind blew across my face like a friendly caress.
80. The spool of thread rolled across the floor.
81. A box of growing plants stood in the Window.
82. I am very happy.
83. These oranges are juicy.
84. Sea water is salty.
85. The streets are full of people.
86. Sugar tastes sweet.
87. The fire feels hot.
88. The little girl seemed lonely.
89. The little boy's father had once been a sailor.
90. I have lost my blanket.
91. A robin has built his nest in the apple tree.
92. At noon we ate our lunch by the roadside.
93. Mr. Jones made a knife for his little boy.
94. Their voices sound very happy.
95. Is today Monday?
96. Have all the leaves fallen from the tree?
97. Will you be ready on time?
98. Will you send this message for me?
99. Are you waiting for me?
100. Is this the first kitten of the litter?
101. Are these shoes too big for you?
102. How wide is the River?
103. Listen.
104. Sit here by me.
105. Keep this secret until tomorrow.
106. Come with us.
107. Bring your friends with you.
108. Be careful.
109. Have some tea.
110. Pip and his dog were great friends.
111. John and Elizabeth are brother and sister.
112. You and I will go together.
113. They opened all the doors and windows.
114. He is small, but strong.
115. Is this tree an oak or a maple?
116. Does the sky look blue or gray?
117. Come with your father or mother.
118. I am tired, but very happy.
119. He played a tune on his wonderful flute.
120. Toward the end of August the days grow much shorter.
121. A company of soldiers marched over the hill and across the meadow.
122. The first part of the story is very interesting.
123. The crow dropped some pebbles into the pitcher and raised the water to the brim.
124. The baby clapped her hands and laughed in glee.
125. Stop your game and be quiet.
126. The sound of the drums grew louder and louder.
127. Do you like summer or winter better?
128. That boy will have a wonderful trip.
129. They popped corn, and then sat around the fire and ate it.
130. They won the first two games, but lost the last one.
131. Take this note, carry it to your mother; and wait for an answer.
132. I awoke early, dressed hastily, and went down to breakfast.
133. Aha! I have caught you!
134. This string is too short!
135. Oh, dear! the wind has blown my hat away!
136. Alas! that news is sad indeed!
137. Whew! that cold wind freezes my nose!
138. Are you warm enough now?
139. They heard the warning too late.
140. We are a brave people, and love our country.
141. All the children came except Mary.
142. Jack seized a handful of pebbles and threw them into the lake.
143. This cottage stood on a low hill, at some distance from the village.
144. On a fine summer evening, the two old people were sitting outside the door of their cottage.
145. Our bird's name is Jacko.
146. The river knows the way to the sea.
147. The boat sails away, like a bird on the wing.
148. They looked cautiously about, but saw nothing.
149. The little house had three rooms, a sitting room, a bedroom, and a tiny kitchen.
150. We visited my uncle's village, the largest village in the world.
151. We learn something new each day.
152. The market begins five minutes earlier this week.
153. Did you find the distance too great?
154. Hurry, children.
155. Madam, I will obey your command.
156. Here under this tree they gave their guests a splendid feast.
157. In winter I get up at night, and dress by yellow candlelight.
158. Tell the last part of that story again.
159. Be quick or you will be too late.
160. Will you go with us or wait here?
161. She was always, shabby, often ragged, and on cold days very uncomfortable.
162. Think first and then act.
163. I stood, a little mite of a girl, upon a chair by the window, and watched the falling snowflakes.
164. Show the guests these shells, my son, and tell them their strange history.
165. Be satisfied with nothing but your best.
166. We consider them our faithful friends.
167. We will make this place our home.
168. The squirrels make their nests warm and snug with soft moss and leaves.
169. The little girl made the doll's dress herself.
170. I hurt myself.
171. She was talking to herself.
172. He proved himself trustworthy.
173. We could see ourselves in the water.
174. Do it yourself.
175. I feel ashamed of myself.
176. Sit here by yourself.
177. The dress of the little princess was embroidered with roses, the national flower of the Country.
178. They wore red caps, the symbol of liberty.
179. With him as our protector, we fear no danger.
180. All her finery, lace, ribbons, and feathers, was packed away in a trunk.
181. Light he thought her, like a feather.
182. Every spring and fall our cousins pay us a long visit.
183. In our climate the grass remains green all winter.
184. The boy who brought the book has gone.
185. These are the flowers that you ordered.
186. I have lost the book that you gave me.
187. The fisherman who owned the boat now demanded payment.
188. Come when you are called.
189. I shall stay at home if it rains.
190. When he saw me, he stopped.
191. Do not laugh at me because I seem so absent minded.
192. I shall lend you the books that you need.
193. Come early next Monday if you can.
194. If you come early, wait in the hall.
195. I had a younger brother whose name was Antonio.
196. Gnomes are little men who live under the ground.
197. He is loved by everybody, because he has a gentle disposition.
198. Hold the horse while I run and get my cap.
199. I have found the ring I lost.
200. Play and I will sing.
201. That is the funniest story I ever heard.
202. She is taller than her brother.
203. They are no wiser than we.
204. Light travels faster than sound.
205. We have more time than they.
206. She has more friends than enemies.
207. He was very poor, and with his wife and five children lived in a little low cabin of logs and stones.
208. When the wind blew, the traveler wrapped his mantle more closely around him.
209. I am sure that we can go.
210. We went back to the place where we saw the roses.
211. "This tree is fifty feet high," said the gardener.
212. I think that this train leaves five minutes earlier today.
213. My opinion is that the governor will grant him a pardon.
214. Why he has left the city is a mystery.
215. The house stands where three roads meet.
216. He has far more money than brains.
217. Evidently that gate is never opened, for the long grass and the great hemlocks grow close against it.
218. I met a little cottage girl; she was eight years old, she said.
