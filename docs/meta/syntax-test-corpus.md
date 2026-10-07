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
3. If the English puts a feeling, belief, want or other stance on **someone other than the speaker** (*she was hurt*, *he thinks*, *it makes sense that you feel*), it is almost never a gap. This has been logged as one several times. Name that person as the holder on the channel, MAY or NOTIONAL word that gives you access to their view (`thunemazawan`, `thewamehon`, `thunelober`: [whose view](../grammar/knowing.md#holder)). For a stance **on** their stance, put your stance in the main sentence and theirs in a dependent with its own holder seam word, naming what their feeling is about (`wadotham gobum zarl zevor wanathumam gobum thunemehon`).
4. Record the phrases you tried in the gap row.

Every Agazan line below was checked with `node scripts/parse.mjs`. `SELFn` is the reader-as-speaker slot ([house cast](grammar-docs.md#house-cast)).

## Translations

| STC | English | Agazan | Morph gloss | Verdict |
|-----|---------|--------|-------------|---------|
| 1 | The sun shines. | `zazaher vabawal.` | z-←sun \| v-shine | covered |
| 2 | The sun is shining. | `zazaher thodom vabawal.` | z-←sun \| th-LIVE \| v-shine | covered |
| 3 | The sun shone. | `zazaher thevom vabawal.` | z-←sun \| th-MEMORY \| v-shine | covered |
| 4 | The sun will shine. | `zazaher thobam bral vabawal.` | z-←sun \| [th-PATTERN \| b-later] \| v-shine | covered |
| 5 | The sun has been shining. | `zazaher thodom hagem vabawal.` | z-←sun \| th-LIVE \| h-still \| v-shine | covered |
| 6 | The sun is shining again. | `zazaher thodom herobem vabawal.` | z-←sun \| th-LIVE \| h-again \| v-shine | covered |
| 7 | The sun will shine tomorrow. | `zazaher thobam bazazam grawol vabawal.` | z-←sun \| [th-PATTERN \| [b-day \| g-one]] \| v-shine | covered |
| 8 | The sun shines brightly. | `zazaher habawal vabawal.` | z-←sun \| h-bright \| v-shine | covered |
| 9 | The bright sun shines. | `zazaher gabawal vabawal.` | [z-←sun \| g-bright] \| v-shine | covered |
| 10 | The sun is rising now. | `zazaher thodom vabaham.` | z-←sun \| th-LIVE \| v-rise | covered |
| 11 | All the people shouted. | `zual gobel thevom valadul.` | [z-everything \| g-person] \| th-MEMORY \| v-shout | covered |
| 12 | Some of the people shouted. | `zoberx gram thevom valadul.` | [z-←person-x \| g-more-than-one.about] \| th-MEMORY \| v-shout | covered |
| 13 | Many of the people shouted twice. | `zoberx thobam zel gral thevom valadul hradul.` | [z-←person-x \| th-PATTERN \| z-rank/more \| g-amount] \| th-MEMORY \| v-shout \| h-two | covered |
| 14 | Happy people often shout. | `zobelx gegevom thobam zel hral valadul.` | [[z-person-x \| g-delight] \| th-PATTERN \| z-rank/more \| h-how-often] \| v-shout | by design (G-01) |
| 15 | The kitten jumped up. | `zebebexagadur thevom vagagel habaham.` | z-baby-x-cat \| th-MEMORY \| v-jump \| h-rise | covered |
| 16 | The kitten jumped onto the table. | `zebebexagadur thevom vagagel aol bexagadel.` | z-baby-x-cat \| th-MEMORY \| v-jump \| [on \| b-scene-x-cutlery] | covered |
| 17 | My little kitten walked away. | `glamazam zebebexagadul em bamun thevom vowogalum.` | [gl-small \| z-baby-x-cat] \| [used-by \| b-speaker] \| th-MEMORY \| v-recede | covered |
| 18 | It's raining. | `thodom verehel.` | th-LIVE \| v-rain | covered |
| 19 | The rain came down. | `zerehel thevom vadahel.` | z-rain \| th-MEMORY \| v-fall | covered |
| 20 | The kitten is playing in the rain. | `zebebexagadur thodom vebegam am berehel.` | z-baby-x-cat \| th-LIVE \| v-play \| [amid \| b-rain] | covered |
| 21 | The rain has stopped. | `thodom hewem verehel.` | th-LIVE \| h-no-longer \| v-rain | covered |
| 22 | Soon the rain will stop. | `thunem brabum hewem verehel.` | [th-CLUES \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 23 | I hope the rain stops soon. | `thevegem thunem brabum hewem verehel.` | th-hope \| [th-CLUES \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 24 | Once wild animals lived here. | `zelebelx gelebem om bamun thenom vahazam.` | [z-leopard-x \| g-nature] \| [near \| b-speaker] \| th-FORMER \| v-home | covered |
| 25 | Slowly she looked around. | `hezehom zalahen thevom vazaham ol bual.` | h-slow \| z-Alahen \| th-MEMORY \| v-look \| [at \| b-everything] | covered |
| 26 | Go away! | `yel vuvudelum.` | y-command \| v-go-recede | covered |
| 27 | Let's go! | `yem zahan vuvudel.` | y-request \| z-interlocutors \| v-go | covered |
| 28 | You should go. | `zehon vuvudel thegathem.` | z-listener \| v-go \| th-sake-ought-offered | covered |
| 29 | I will be happy to go. | `zSELFn thamam vuvudel thozothamam.` | z-SELF \| th-plan-itinerary \| v-go \| th-pleasure-met-any-term-INTERNAL-FLOWING | covered |
| 30 | He will arrive soon. | `zazawan thunem brabum vevahal.` | z-Azawan \| [th-CLUES \| b-+-e-.about] \| v-arrival | covered |
| 31 | The baby's ball has rolled away. | `zobohel em bebebel thamom vewawelum.` | z-ball \| [used-by \| b-baby] \| th-RESIDUE \| v-wheel-recede | covered |
| 32 | The two boys are working together. | `zobohalx gradul thodom vozewemx.` | [z-boy-x \| g-two] \| th-LIVE \| v-effort-x | covered |
| 33 | This mist will probably clear away. | `zavegel om bamun thral thunem bral vemehulum.` | z-fog \| [near \| b-speaker] \| th-likely \| [th-CLUES \| b-later] \| v-melt-recede | covered |
| 34 | Lovely flowers are growing everywhere. | `zavavulx gahabem thodom vuzem ol bual.` | [z-flower-x \| g-beauty] \| th-LIVE \| v-growth \| [at \| b-everything] | covered |
| 35 | We should eat more slowly. | `zahan thobam zel hezehom vagadel thegathem.` | [z-interlocutors \| th-PATTERN \| z-rank/more \| h-slow] \| v-eat \| th-sake-ought-offered | covered |
| 36 | You have come too soon. | `zehon thegatham zuel bral vuvudel eol bamun.` | [z-listener \| th-sake-met-any-term \| z-rank/less \| b-later] \| v-go \| [toward \| b-speaker] | covered |
| 37 | You must write more neatly. | `zehon thobam zel hozobam varadal thumem.` | [z-listener \| th-PATTERN \| z-rank/more \| h-cleanliness] \| v-write \| th-REQUIRE-demanded | covered |
| 38 | Directly opposite stands a wonderful palace. | `honovathahan zagazol gezum vazadol.` | h-north-th-interlocutors \| [z-castle \| g-amazement] \| v-stand | covered |
| 39 | Henry's dog is lost. | `zodogal gadadum em bazawan.` | [z-dog \| g-loss] \| [used-by \| b-Azawan] | covered |
| 40 | My cat is black. | `zagadul gabagol em bamun.` | [z-cat \| g-black] \| [used-by \| b-speaker] | covered |
| 41 | The little girl's doll is broken. | `zenezel galazem em begehal gamazam.` | [z-nesting-doll \| g-breakdown] \| [used-by \| [b-girl \| g-small]] | covered |
| 42 | I usually sleep soundly. | `zSELFn huam vezebal hanayam.` | z-SELF \| h-always.open \| v-sleep \| h-depth | covered |
| 43 | The children ran after Jack. | `zahadolx thevom dahaben verezam.` | z-child-x \| th-MEMORY \| d-Ahaben \| v-pursuit | covered |
| 44 | I can play after school. | `zSELFn vebegaxam henum buzugul.` | z-SELF \| v-play-able \| [h-after \| b-school] | covered |
| 45 | We went to the village for a visit. | `zahan thevom vuvudel eol bahedem hogom bowogalol.` | z-interlocutors \| th-MEMORY \| v-go \| [toward \| b-locality] \| [h-so-that \| b-attend] | covered |
| 46 | We arrived at the river. | `zahan thevom vevahal ol bowodel.` | z-interlocutors \| th-MEMORY \| v-arrival \| [at \| b-drinking-water] | covered |
| 47 | I have been waiting for you. | `zSELFn thodom hagem dehon vabazam.` | z-SELF \| th-LIVE \| h-still \| d-listener \| v-wait | covered |
| 48 | The campers sat around the fire. | `zaxagabolx thevom vehahel hugem bavahel.` | z-agent-x-camp-x \| th-MEMORY \| v-sit \| [h-around \| b-fire] | covered |
| 49 | A little girl with a kitten sat near me. | `glamazam zegehal gan bebebexagadul thevom vehahel om bamun.` | [gl-small \| z-girl \| [g-including \| b-baby-x-cat]] \| th-MEMORY \| v-sit \| [near \| b-speaker] | covered |
| 50 | The child waited at the door for her father. | `zahador thevom vabazam ol boyel glemehel dobel grebuwol bahador.` | z-←child \| th-MEMORY \| v-wait \| at \| b-door \| gl-male \| d-person \| g-#-e-1 \| b-←←child | covered |
| 51 | Yesterday the oldest girl in the village lost her kitten. | `zegehal zel gebevam al bahedem thevom bazazam gruwol debebexagadul em begehar vadadum.` | [z-girl \| z-rank/more \| g-age] \| [in \| b-locality] \| [th-MEMORY \| [b-day \| g-minus-one]] \| d-baby-x-cat \| [used-by \| b-←girl] \| v-loss | covered |
| 52 | Were you born in this village? | `yol ? zehon al bahedem om bamun vohal.` | y-question \| ? \| z-listener \| [in \| b-locality] \| [near \| b-speaker] \| v-hatch | covered |
| 53 | Can your brother dance well? | `yol ? glemehel zobel grebazol behon vadazexal hebaham.` | y-question \| [? \| gl-male \| z-person \| [g-#-e0 \| b-listener]] \| v-dance-able \| h-excellence | covered |
| 54 | Did the man leave? | `yol ? zamahar vedabal.` | y-question \| ? \| z-←man \| v-departure | covered |
| 55 | Is your sister coming for you? | `yol ? gleveval zobel grebazol behon vuvudel eol behon.` | y-question \| [? \| gl-female \| z-person \| [g-#-e0 \| b-listener]] \| v-go \| [toward \| b-listener] | covered |
| 56 | Can you come tomorrow? | `yol ? zehon thamam bazazam grawol vuvudel eol bamun.` | y-question \| ? \| z-listener \| [th-plan-itinerary \| [b-day \| g-one]] \| v-go \| [toward \| b-speaker] | covered |
| 57 | Have the neighbors gone away for the winter? | `yol ? zaxahazamx om bahan thamom vuvudelum huwem bagazum.` | y-question \| ? \| z-agent-x-home-x \| [near \| b-interlocutors] \| th-RESIDUE \| v-go-recede \| [h-while \| b-winter] | covered |
| 58 | Does the robin sing in the rain? | `yol ? zuam geredaxebedul vezehel am berehel.` | y-question \| [? \| z-everything.open \| g-red-x-bird] \| v-sing \| [amid \| b-rain] | covered |
| 59 | Are you going with us to the concert? | `yol ? zehon han bamunx vuvudel eol bexezehel.` | y-question \| ? \| z-listener \| [h-including \| b-speaker-x] \| v-go \| [toward \| b-scene-x-sing] | covered |
| 60 | Have you ever travelled in the jungle? | `yol ? zehon hoham vehebam am babahuxedehulx har.` | y-question \| ? \| z-listener \| h-already \| v-voyage \| [amid \| b-palm-x-tree-x] \| h-when | covered |
| 61 | We sailed down the river for several miles. | `zamunx thevom bezezem grabarem vehebal uol bowodel.` | z-speaker-x \| [th-MEMORY \| [b-meter \| g-+-e3.about]] \| v-ship \| [through \| b-drinking-water] | covered |
| 62 | Everybody knows about hunting. | `zuam vugum hahehom buwuvam.` | z-everything.open \| v-knowledge \| [h-topic \| b-predation] | covered |
| 63 | On a Sunny morning after the solstice we started for the mountains. | `ol bedebem gazahel henum bazahexazadal zamunx thevom damadalx vuvudeleol.` | [at \| [b-dawn \| g-sun]] \| [h-after \| b-sun-x-stop] \| z-speaker-x \| th-MEMORY \| d-mountain-x \| v-go-head-for | covered |
| 64 | Tom laughed at the monkey's tricks. | `zamagel vedevam. zazawan thevom valavol ol bedevar.` | z-monkey \| v-mischief . z-Azawan \| th-MEMORY \| v-laugh \| [at \| b-←mischief] | covered |
| 65 | An old man with a walking stick stood beside the fence. | `zoladal gan begehol thevom vazadol om buwulagezal.` | [z-old-man \| [g-including \| b-cane]] \| th-MEMORY \| v-stand \| [near \| b-fence] | covered |
| 66 | The squirrel's nest was hidden by drooping boughs. | `denezal em bahebul thevom zedehuxobolx gadahel vohahem.` | d-nest \| [used-by \| b-chipmunk] \| th-MEMORY \| [z-tree-x-bone-x \| g-down] \| v-concealment | covered |
| 67 | The little seeds waited patiently under the snow for the warm spring sun. | `glamazam zuzelx hadahel bozezol thevom halawem vabazam dazahel wamazam gahadul guwem bahazum.` | [gl-small \| z-seedling-x] \| [h-down \| b-snow] \| th-MEMORY \| h-composure \| v-wait \| [d-sun \| [w-small \| g-hot] \| [g-while \| b-spring]] | covered |
| 68 | Many little girls with wreaths of flowers on their heads danced around the bonfire. | `zegehalx gamazam gan bavavulagayelx thobam zel gral thevom vadazel hugem bavahel.` | [[z-girl-x \| g-small \| [g-including \| b-wreath-x]] \| th-PATTERN \| z-rank/more \| g-amount] \| th-MEMORY \| v-dance \| [h-around \| b-fire] | covered |
| 69 | The cover of the basket fell to the floor. | `zabahal gobom babezal thevom vadahel eol bahazalagadol.` | [z-up \| [g-part-of \| b-basket]] \| th-MEMORY \| v-fall \| [toward \| b-floor] | covered |
| 70 | The first boy in the line stopped at the entrance. | `zobohal grewol thevom vazadal ol boyel.` | [z-boy \| g-1st] \| th-MEMORY \| v-stop \| [at \| b-door] | covered |
| 71 | On the top of the hill in a little hut lived a wise old woman. | `aol bamadal thavom al bahedel gamazam vahazam zoladel geladem.` | [on \| b-mountain] \| th-NOTIONAL \| [in \| [b-hut \| g-small]] \| v-home \| [z-old-woman \| g-wisdom] | covered |
| 72 | During our residence in the country we often walked in the pastures. | `zamunx thobam zel hral thevom vowogal am bevedalx huwem barl zamunx vahazam am bagedom.` | [z-speaker-x \| th-PATTERN \| z-rank/more \| h-how-often] \| th-MEMORY \| v-walk \| [amid \| b-field-x] \| [h-while \| b-that-clause] \| z-speaker-x \| v-home \| [amid \| b-rural] | covered |
| 73 | When will your guests from the city arrive? | `yol har glagum bezagam zobelx gabubam behon thunem bral vevahal.` | y-question \| h-when \| [[gl-origin \| b-urban] \| z-person-x \| [g-hospitality \| b-listener]] \| [th-CLUES \| b-later] \| v-arrival | covered |
| 74 | Near the mouth of the river, its course turns sharply towards the East. | `om bamaval gobom bowodel zowoder hanavam verevem eol bodul.` | [near \| [b-mouth \| [g-part-of \| b-drinking-water]]] \| z-←drinking-water \| h-severity \| v-turn \| [toward \| b-east] | covered |
| 75 | Between the two lofty mountains lay a fertile valley. | `hazam bamadalx gradul gadavem zadahel gamahum.` | [h-between \| [b-mountain-x \| g-two \| g-height]] \| [z-down \| g-proliferation] | covered |
| 76 | Among the wheat grew tall red poppies. | `am begevel thevom vuzem zavavulx gadavem geredal.` | [amid \| b-grain] \| th-MEMORY \| v-growth \| [z-flower-x \| g-height \| g-red] | covered |
| 77 | The strong roots of the oak trees were torn from the ground. | `dedehuxuvudalx gabezem gobom banedoledehulx thevom habahem vahegum ual bagadol.` | [d-tree-x-foot-x \| g-strength \| [g-part-of \| b-oak-x]] \| th-MEMORY \| h-force \| v-removal \| [out-of \| b-ground] | covered |
| 78 | The sun looked down through the branches upon the children at play. | `zazaher thevom hadahel uol bedehuxobolx vazaham ol bahadolx gaxebegam.` | z-←sun \| th-MEMORY \| h-down \| [through \| b-tree-x-bone-x] \| v-look \| [at \| [b-child-x \| g-agent-x-recreation]] | covered |
| 79 | The west wind blew across my face like a friendly caress. | `zewedul gewezal thevom vewedul hebum bevezal em bamun humum bahagel gazahum.` | [z-wind \| g-west] \| th-MEMORY \| v-wind \| [h-across \| b-face] \| [used-by \| b-speaker] \| [h-like \| [b-hug \| g-goodwill]] | covered |
| 80 | The spool of thread rolled across the floor. | `zayahal thevom vewawel hebum bahazalagadol.` | z-yarn \| th-MEMORY \| v-wheel \| [h-across \| b-floor] | covered |
| 81 | A box of growing plants stood in the Window. | `zabegol gahem bahabolx gaxuzem thevom vazadol al bewedol.` | [z-package \| [g-contents \| [b-house-plant-x \| g-agent-x-growth]]] \| th-MEMORY \| v-stand \| [in \| b-window] | covered |
| 82 | I am very happy. | `welavam thozothamam.` | [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] | covered |
| 83 | These oranges are juicy. | `zadeherx guhuzal om bamun.` | [z-←tangerine-x \| g-juice] \| [near \| b-speaker] | covered |
| 84 | Sea water is salty. | `zuam gohahaxowodel gozodel.` | [z-everything.open \| g-ocean-x-drinking-water] \| g-salt | covered |
| 85 | The streets are full of people. | `zobelx thobam zel gral al borodalx.` | [z-person-x \| th-PATTERN \| z-rank/more \| g-amount] \| [in \| b-road-x] | covered |
| 86 | Sugar tastes sweet. | `zual gagedem gozom thobam.` | [z-everything \| g-sugar] \| g-sweetness \| th-PATTERN | covered |
| 87 | The fire feels hot. | `zavaher gahadul thodom.` | [z-←fire \| g-hot] \| th-LIVE | covered |
| 88 | The little girl seemed lonely. | `thanathumam thunemegehar.` | th-relatedness-unmet-modifiable-INTERNAL-FLOWING \| th-CLUES-←girl | by design (G-01) |
| 89 | The little boy's father had once been a sailor. | `glemehel zobel gaxehebal grebuwol bobohal gamazam thenom.` | [gl-male \| z-person \| g-agent-x-ship \| [g-#-e-1 \| [b-boy \| g-small]]] \| th-FORMER | covered |
| 90 | I have lost my blanket. | `zSELFn thamom dayaham em bamun vadadum.` | z-SELF \| th-RESIDUE \| d-blanket \| [used-by \| b-speaker] \| v-loss | covered |
| 91 | A robin has built his nest in the apple tree. | `zeredaxebedul thamom denezal vagozal al babovuxedehul.` | z-red-x-bird \| th-RESIDUE \| d-nest \| v-construct \| [in \| b-apple-x-tree] | covered |
| 92 | At noon we ate our lunch by the roadside. | `h_12 zamunx thevom debedol em bamunx vagadel om bexuvudel.` | h-_12 \| z-speaker-x \| th-MEMORY \| d-bento \| [used-by \| b-speaker-x] \| v-eat \| [near \| b-scene-x-footprints] | covered |
| 93 | Mr. Jones made a knife for his little boy. | `zahaben thevom danaval vameval el bobohal gamazam grebawol bahaber.` | z-Ahaben \| th-MEMORY \| d-knife \| v-manufacture \| [for \| [b-boy \| g-small \| [g-#-e1 \| b-←Ahaben]]] | covered |
| 94 | Their voices sound very happy. | `welavam thozothamam thodomoberx.` | [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] \| th-LIVE-←person-x | covered |
| 95 | Is today Monday? | `yol ? zelagam grewol thodom.` | y-question \| [? \| z-weekday \| g-1st] \| th-LIVE | covered |
| 96 | Have all the leaves fallen from the tree? | `yol ? zual gelevol ul bedehul hoham vadahel.` | y-question \| [? \| z-everything \| g-leaf] \| [from \| b-tree] \| h-already \| v-fall | covered |
| 97 | Will you be ready on time? | `yol ? zehon thunem bral vabam hawaham.` | y-question \| ? \| z-listener \| [th-CLUES \| b-later] \| v-preparation \| h-punctuality | covered |
| 98 | Will you send this message for me? | `yem zehon demeham om bamun vobozam hadem bamun.` | y-request \| z-listener \| d-message \| [near \| b-speaker] \| v-dispatch \| [h-on-behalf-of \| b-speaker] | covered |
| 99 | Are you waiting for me? | `yol ? zehon damun vabazam.` | y-question \| ? \| z-listener \| d-speaker \| v-wait | covered |
| 100 | Is this the first kitten of the litter? | `yol ? zebebexagadur g#1e0 om bamun.` | y-question \| [? \| z-baby-x-cat \| g-#-1e0] \| [near \| b-speaker] | covered |
| 101 | Are these shoes too big for you? | `yol ? zuhahurx thegatham behon zel gelavam.` | y-question \| [? \| z-←shoe-x \| [th-sake-met-any-term \| b-listener] \| z-rank/more \| g-big] | covered |
| 102 | How wide is the River? | `yol zowoder wrar gegodem.` | y-question \| z-←drinking-water \| [w-how-many \| g-width] | covered |
| 103 | Listen. | `yel vewam.` | y-command \| v-listening | covered |
| 104 | Sit here by me. | `yel vehahel om bamun.` | y-command \| v-sit \| [near \| b-speaker] | covered |
| 105 | Keep this secret until tomorrow. | `yel darth vaheham homam bazazam grawol.` | y-command \| d-that-same-claim \| v-confidentiality \| [h-until \| [b-day \| g-one]] | covered |
| 106 | Come with us. | `yel han bamunx vuvudel.` | y-command \| [h-including \| b-speaker-x] \| v-go | covered |
| 107 | Bring your friends with you. | `yel han bobelx gemezem behon vuvudel eol bamun.` | y-command \| [h-including \| [b-person-x \| [g-companionship \| b-listener]]] \| v-go \| [toward \| b-speaker] | covered |
| 108 | Be careful. | `yel geyayem.` | y-command \| g-caution | covered |
| 109 | Have some tea. | `yem dedehel gral vedeyol.` | y-request \| [d-tea \| g-more-than-one] \| v-drink | covered |
| 110 | Pip and his dog were great friends. | `zazawan zodogal em bazawar zal welavam gemezem thevom.` | [z-Azawan \| [z-dog \| [used-by \| b-←Azawan]] \| z-and \| [w-very \| g-companionship]] \| th-MEMORY | awkward (G-17) |
| 111 | John and Elizabeth are brother and sister. | `zazawan gemehel zalahen geveval zal grebazol.` | [[z-Azawan \| g-male] \| [z-Alahen \| g-female] \| z-and \| g-#-e0] | awkward (G-17) |
| 112 | You and I will go together. | `zahan thamam vuvudelx.` | z-interlocutors \| th-plan-itinerary \| v-go-x | covered |
| 113 | They opened all the doors and windows. | `zobelx thevom dual goyel voyel xal zoberx dual gewedol voyel.` | [z-person-x \| th-MEMORY \| [d-everything \| g-door] \| v-open \| x-and \| z-←person-x-x \| [d-everything \| g-window] \| v-open] | covered |
| 114 | He is small, but strong. | `zazawan gamazam. xagezam zazawar gabezem.` | z-Azawan \| g-small . x-but \| z-←Azawan \| g-strength | covered |
| 115 | Is this tree an oak or a maple? | `yol zedehur ganedoledehul gemebal ?gar.` | y-question \| z-←tree \| [g-oak \| g-maple \| ?g-wh] | covered |
| 116 | Does the sky look blue or gray? | `yol zagavum gubuhel gegeval ?gar thodom.` | y-question \| [z-sky \| [g-blue \| g-gray \| ?g-something]] \| th-LIVE | covered |
| 117 | Come with your father or mother. | `yel han bobel grebuwol behon vuvudel eol bamun.` | y-command \| [h-including \| [b-person \| [g-#-e-1 \| b-listener]]] \| v-go \| [toward \| b-speaker] | covered |
| 118 | I am tired, but very happy. | `zSELFn gadadal. xagezam welavam thozothamam.` | z-SELF \| g-tired . x-but \| [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] | covered |
| 119 | He played a tune on his wonderful flute. | `zazawan thevom duduhal vamum ael buvudul gezum em bazawar.` | z-Azawan \| th-MEMORY \| d-tune \| v-performance \| [using \| [b-flute \| g-amazement]] \| [used-by \| b-←Azawan] | covered |
| 120 | Toward the end of August the days grow much shorter. | `om b_#31,8 zazazamx thobam zuel welavam gadaham thobam.` | [near \| b-_31,8] \| [z-day-x \| th-PATTERN \| z-rank/less \| [w-very \| g-duration]] \| th-PATTERN | covered |
| 121 | A company of soldiers marched over the hill and across the meadow. | `aom bamadal gamazam zagavolx thevom vowogalx hebum begewolx.` | [over \| [b-mountain \| g-small]] \| z-guard-x \| th-MEMORY \| v-walk-x \| [h-across \| b-greens-x] | covered |
| 122 | The first part of the story is very interesting. | `zabeger welavam gagadum gobom bozem.` | [z-←begin \| [w-very \| g-curiosity] \| [g-part-of \| b-tale]] | covered |
| 123 | The crow dropped some pebbles into the pitcher and raised the water to the brim. | `zabagoxebedul thevom daragalx gamazam vadahel al bamevel xan zabagoxebedur dowoder vabahal eol babahal gobom bamever.` | [z-black-x-bird \| th-MEMORY \| [d-rock-x \| g-small] \| v-fall \| [in \| b-amphora] \| x-and-then \| z-←black-x-bird \| d-←drinking-water \| v-up \| [toward \| [b-up \| [g-part-of \| b-←amphora]]]] | covered |
| 124 | The baby clapped her hands and laughed in glee. | `zebeber thevom vagebul valavol val hegevom.` | z-←baby \| th-MEMORY \| [v-clap \| v-laugh \| v-and \| h-delight] | covered |
| 125 | Stop your game and be quiet. | `yel hewem vebegam xal gezebom.` | y-command \| [h-no-longer \| v-play \| x-and \| g-silence] | covered |
| 126 | The sound of the drums grew louder and louder. | `zadehal gagum badavolx thevom hagawam vabedel.` | [z-audio \| [g-origin \| b-drum-x]] \| th-MEMORY \| h-volume \| v-uptrend | covered |
| 127 | Do you like summer or winter better? | `yol zehon dazegem dagazum ?der valavam.` | y-question \| z-listener \| [d-summer \| d-winter \| ?d-which-rank] \| v-cherished | covered |
| 128 | That boy will have a wonderful trip. | `zobohar thunem bral vehebam hezum.` | z-←boy \| [th-CLUES \| b-later] \| v-voyage \| h-amazement | covered |
| 129 | They popped corn, and then sat around the fire and ate it. | `zobelx thevom dababol vugugel xan zoberx vehahel hugem bavahel xan zoberx dababor vagadel.` | [z-person-x \| th-MEMORY \| d-popcorn \| v-cooking \| x-and-then \| z-←person-x-x \| v-sit \| [h-around \| b-fire] \| x-and-then \| z-←person-x-x \| d-←popcorn \| v-eat] | covered |
| 130 | They won the first two games, but lost the last one. | `zobelx thevom dezademx g#1 al g#2 vevegol. xagezam zoberx dezadem g#-1 vadadum.` | z-person-x \| th-MEMORY \| [d-contest-x \| g-1st.short] \| through \| g-2nd.short \| v-victory . x-but \| z-←person-x-x \| [d-contest \| g-1st-from-end.short] \| v-loss | covered |
| 131 | Take this note, carry it to your mother; and wait for an answer. | `yel demeham om bamun valagel eol bobel geveval grebuwol behon xal vabazam dezebem.` | y-command \| [d-message \| [near \| b-speaker] \| v-carry \| [toward \| [b-person \| g-female \| [g-#-e-1 \| b-listener]]] \| x-and \| v-wait \| d-discourse] | covered |
| 132 | I awoke early, dressed hastily, and went down to breakfast. | `zSELFn thobam zuel bral thevom vabahal xan zSELFn hadehum vedezal xan zSELFn vuvudel hadahel eol bebedol gedebem.` | [[z-SELF \| th-PATTERN \| z-rank/less \| b-later] \| th-MEMORY \| v-up \| x-and-then \| z-SELF \| h-haste \| v-dress \| x-and-then \| z-SELF \| v-go \| h-down \| [toward \| [b-bento \| g-dawn]]] | covered |
| 133 | Aha! I have caught you! | `!yaleden. zSELFn thamom dehon vamazel.` | !y-Aleden . z-SELF \| th-RESIDUE \| d-listener \| v-mousetrap | covered |
| 134 | This string is too short! | `! zevevur om bamun thegatham zuel geregam.` | [[! \| z-←thread \| [near \| b-speaker]] \| th-sake-met-any-term \| z-rank/less \| g-length] | covered |
| 135 | Oh, dear! the wind has blown my hat away! | `!yewedan. zewedur thamom dazehal em bamun vewedulum.` | !y-Ewedan . z-←wind \| th-RESIDUE \| d-sun-hat \| [used-by \| b-speaker] \| v-wind-recede | covered |
| 136 | Alas! that news is sad indeed! | `!yagahun. zunuzer wanathumam gobum.` | !y-Agahun . z-←newspaper \| [w-relatedness-unmet-modifiable-INTERNAL-FLOWING \| g-stimulus] | covered |
| 137 | Whew! that cold wind freezes my nose! | `!yuvuyun. zewedur gogodel donozal gobom bamun vazahol.` | !y-Uvuyun . [z-←wind \| g-cold] \| [d-nose \| [g-part-of \| b-speaker]] \| v-ice | covered |
| 138 | Are you warm enough now? | `yol ? zehon thegatham zeol gahadul thahom bagazem grazol.` | y-question \| [? \| z-listener \| th-sake-met-any-term \| z-equal-rank \| g-hot] \| [th-INTUITION \| [b-hour \| g-zero]] | covered |
| 139 | They heard the warning too late. | `zobelx thegatham zel bral thevom dowawol vewal.` | [z-person-x \| th-sake-met-any-term \| z-rank/more \| b-later] \| th-MEMORY \| d-warning \| v-hear | covered |
| 140 | We are a brave people, and love our country. | `zamunx galahem xal zamunx dagul em bamunx valaval.` | [z-speaker-x \| g-courage \| x-and \| z-speaker-x \| d-country \| [used-by \| b-speaker-x] \| v-love] | covered |
| 141 | All the children came except Mary. | `zual gahadol ul zalahen thevom vevahal.` | [z-everything \| g-child] \| except \| z-Alahen \| th-MEMORY \| v-arrival | covered |
| 142 | Jack seized a handful of pebbles and threw them into the lake. | `zahaben thevom dahadal gahem baragalx gamazam vevedul xan zahaber daragarx vubuhal al bagawom.` | [z-Ahaben \| th-MEMORY \| [d-hand \| [g-contents \| [b-rock-x \| g-small]]] \| v-fist \| x-and-then \| z-←Ahaben \| d-←rock-x-x \| v-throw \| [in \| b-lake]] | covered |
| 143 | This cottage stood on a low hill, at some distance from the village. | `zagedor thavom vazadol aol bamadal gamazam um bahedem.` | z-←cottage \| th-NOTIONAL \| v-stand \| [on \| [b-mountain \| g-small]] \| [away-from \| b-locality] | covered |
| 144 | On a fine summer evening, the two old people were sitting outside the door of their cottage. | `ol badazol gahabem guwem bazegem zobelx gradul goladam thavom vehahel ol boyel gobom bagedol em boberx.` | [at \| [b-dusk \| g-beauty \| [g-while \| b-summer]]] \| [z-person-x \| g-two \| g-elderhood] \| th-NOTIONAL \| v-sit \| [at \| [b-door \| [g-part-of \| b-cottage]]] \| [used-by \| b-←person-x-x] | covered |
| 145 | Our bird's name is Jacko. | `zebedul em bamunx. zebedur gugol bahaben.` | z-bird \| [used-by \| b-speaker-x] . z-←bird \| [g-SAME \| b-Ahaben] | covered |
| 146 | The river knows the way to the sea. | `zowoder dorodal eol bohahal vugum.` | z-←drinking-water \| d-road \| [toward \| b-ocean] \| v-knowledge | covered |
| 147 | The boat sails away, like a bird on the wing. | `zobodar thodom vobodalum humum bebedul gaxewehal.` | z-←boat \| th-LIVE \| v-boat-recede \| [h-like \| [b-bird \| g-agent-x-wing]] | covered |
| 148 | They looked cautiously about, but saw nothing. | `zobelx thevom heyayem vazaham ol bual. xagezam zoberx dal vahahal.` | z-person-x \| th-MEMORY \| h-caution \| v-look \| [at \| b-everything] . x-but \| z-←person-x-x \| d-none \| v-see | covered |
| 149 | The little house had three rooms, a sitting room, a bedroom, and a tiny kitchen. | `zexehahel zexezebal zexugugel welavam gamazam zal gobom bahazar gamazam thevom.` | [z-scene-x-chair \| z-scene-x-sleep \| [z-scene-x-cooking \| [w-very \| g-small]] \| z-and \| [g-part-of \| [b-←house \| g-small]]] \| th-MEMORY | covered |
| 150 | We visited my uncle's village, the largest village in the world. | `zamunx thevom dahedem em bobel gemehel grebazol bobel grebuwol bamun vowogalol. zaheder zel gelavam al bogobal.` | z-speaker-x \| th-MEMORY \| d-locality \| [used-by \| [b-person \| g-male \| [g-#-e0 \| [b-person \| [g-#-e-1 \| b-speaker]]]]] \| v-attend . [z-←locality \| z-rank/more \| g-big] \| [in \| b-globe] | covered |
| 151 | We learn something new each day. | `zamunx velehal dar gunuzem hrawol hruwol bazazam.` | z-speaker-x \| v-learn \| [d-something \| g-news] \| h-one \| [h-divided-by-one \| b-day] | covered |
| 152 | The market begins five minutes earlier this week. | `zozodom thobam zuel bral bavegam g+5 vabegel huwem bagadar om bamun.` | [z-market \| th-PATTERN \| z-rank/less \| b-later] \| [b-minute \| g-five.short] \| v-begin \| [h-while \| [b-←calendar \| [near \| b-speaker]]] | covered |
| 153 | Did you find the distance too great? | `yol ? zeregam thegatham behon zel gelavam thevom.` | y-question \| [? \| z-length \| [th-sake-met-any-term \| b-listener] \| z-rank/more \| g-big] \| th-MEMORY | covered |
| 154 | Hurry, children. | `yahadolx. yel vadehum.` | y-child-x . y-command \| v-haste | covered |
| 155 | Madam, I will obey your command. | `yehon. zSELFn thamam vuyoyum dehon.` | y-listener . z-SELF \| th-plan-itinerary \| v-conformity \| d-listener | covered |
| 156 | Here under this tree they gave their guests a splendid feast. | `zobelx thevom om bamun hadahel bedehur vebel bobelx gabubam boberx debedol gezum.` | z-person-x \| th-MEMORY \| [near \| b-speaker] \| [h-down \| b-←tree] \| v-present \| [b-person-x \| [g-hospitality \| b-←person-x-x]] \| [d-bento \| g-amazement] | covered |
| 157 | In winter I get up at night, and dress by yellow candlelight. | `zSELFn huam huwem bagazum vabahal huwem banadal xal zSELFn vedezal ael bagogal geyayel.` | [z-SELF \| h-always.open \| [h-while \| b-winter] \| v-up \| [h-while \| b-night] \| x-and \| z-SELF \| v-dress \| [using \| [b-candle \| g-yellow]]] | covered |
| 158 | Tell the last part of that story again. | `yel herobem deveham gobom bozem vezebel.` | y-command \| h-again \| [d-terminus \| [g-part-of \| b-tale]] \| v-tell | covered |
| 159 | Be quick or you will be too late. | `yel gadehum xol zehon thegatham zel bral vevahal.` | y-command \| [g-haste \| x-or-exactly-one \| [z-listener \| th-sake-met-any-term \| z-rank/more \| b-later] \| v-arrival] | covered |
| 160 | Will you go with us or wait here? | `yol ? zehon thamam han bamunx vuvudel xol zehon thamam vabazam om bamun.` | y-question \| [? \| z-listener \| th-plan-itinerary \| [h-including \| b-speaker-x] \| v-go \| x-or-exactly-one \| z-listener \| th-plan-itinerary \| v-wait \| [near \| b-speaker]] | covered |
| 161 | She was always, shabby, often ragged, and on cold days very uncomfortable. | `zalahen thevom hual galazem. zalahen thobam zel hral welavam galazem thevom. zalahen thevom welavam gahagem gul huwem bazazamx gogodel.` | z-Alahen \| th-MEMORY \| h-always-except \| g-breakdown . [z-Alahen \| th-PATTERN \| z-rank/more \| h-how-often] \| [w-very \| g-breakdown] \| th-MEMORY . z-Alahen \| th-MEMORY \| [[w-very \| g-comfort] \| g-not] \| [h-while \| [b-day-x \| g-cold]] | covered |
| 162 | Think first and then act. | `yel vevegal xan vozewem.` | y-command \| [v-think \| x-and-then \| v-effort] | covered |
| 163 | I stood, a little mite of a girl, upon a chair by the window, and watched the falling snowflakes. | `zSELFn th(zSELFr gegehal gamazam) thevom vazadol aol behahel om bewedol xal zSELFn thevom vazaham dozovelx gaxadahel.` | [z-SELF \| th-ASIDE[z-←SELF \| g-girl \| g-small] \| th-MEMORY \| v-stand \| [on \| b-chair] \| [near \| b-window] \| x-and \| z-SELF \| th-MEMORY \| v-look \| [d-snowflake-x \| g-agent-x-down]] | covered |
| 164 | Show the guests these shells, my son, and tell them their strange history. | `yehon. yel zobelx gabubam bamun deheholx om bamun vahahal thegem behon. yel boberx dozem gelehom em boberx vezebel.` | y-listener . y-command \| [z-person-x \| [g-hospitality \| b-speaker]] \| d-shell-x \| [near \| b-speaker] \| v-see \| [th-CAUSE \| b-listener] . y-command \| b-←person-x-x \| [d-tale \| g-strangeness] \| [used-by \| b-←person-x-x] \| v-tell | covered |
| 165 | Be satisfied with nothing but your best. | `yel gerevam ol bozewem em behon bal.` | y-command \| g-calm \| [at \| [[b-effort \| [used-by \| b-listener]] \| b-and]] | covered |
| 166 | We consider them our faithful friends. | `zamunx vevegal darl zoberx godogam gemezem bamunx.` | z-speaker-x \| v-think \| d-that-clause \| [z-←person-x \| g-loyalty \| [g-companionship \| b-speaker-x]] | covered |
| 167 | We will make this place our home. | `zamunx thamam dahedem om bamun vameval el bahazam em bamunx.` | z-speaker-x \| th-plan-itinerary \| d-locality \| [near \| b-speaker] \| v-manufacture \| [for \| b-home] \| [used-by \| b-speaker-x] | covered |
| 168 | The squirrels make their nests warm and snug with soft moss and leaves. | `zahebulx huam denezalx wadeham gahadul gahagem em bahebur ael bebahel belevol bal vameval.` | z-chipmunk-x \| h-always.open \| [d-nest-x \| [w-quite \| g-hot] \| g-comfort] \| [used-by \| b-←chipmunk-x] \| [using \| [b-herb \| b-leaf \| b-and]] \| v-manufacture | covered |
| 169 | The little girl made the doll's dress herself. | `zegehal gamazam zal thevom dedezal em benezel vameval.` | [[z-girl \| g-small] \| z-and] \| th-MEMORY \| d-dress \| [used-by \| b-nesting-doll] \| v-manufacture | covered |
| 170 | I hurt myself. | `zSELFn dSELFr venehem.` | z-SELF \| d-←SELF \| v-harm | covered |
| 171 | She was talking to herself. | `zalahen thevom balaher vezebel.` | z-Alahen \| [th-MEMORY \| b-←Alahen] \| v-tell | covered |
| 172 | He proved himself trustworthy. | `zazawan thevom dazawar gegehom verazem.` | z-Azawan \| th-MEMORY \| [d-←Azawan \| g-trust] \| v-proof | covered |
| 173 | We could see ourselves in the water. | `zamunx thevom damurx vahahal al bowodel.` | z-speaker-x \| th-MEMORY \| d-←speaker-x-x \| v-see \| [in \| b-drinking-water] | covered |
| 174 | Do it yourself. | `yel zehon zal vozewem.` | y-command \| [z-listener \| z-and] \| v-effort | covered |
| 175 | I feel ashamed of myself. | `zSELFn thanathumom bSELFr.` | z-SELF \| [th-relatedness-unmet-modifiable-AIMED-FLOWING \| b-←SELF] | covered |
| 176 | Sit here by yourself. | `yel zehon zal vehahel om bamun.` | y-command \| [z-listener \| z-and] \| v-sit \| [near \| b-speaker] | covered |
| 177 | The dress of the little princess was embroidered with roses, the national flower of the Country. | `dedezal em begehal gamazam gagayem venedal ael borozalx. zorozarx gavavul gobom bagul.` | d-dress \| [used-by \| [b-girl \| g-small \| g-leadership]] \| v-needle \| [using \| b-rose-x] . [z-←rose-x-x \| g-flower \| [g-part-of \| b-country]] | covered |
| 178 | They wore red caps, the symbol of liberty. | `zobelx thevom dahodalx geredal vedezal. zahodarx gezezul gahehom bazodam.` | z-person-x \| th-MEMORY \| [d-hat-x \| g-red] \| v-dress . [z-←hat-x-x \| g-symbols \| [g-topic \| b-liberty]] | covered |
| 179 | With him as our protector, we fear no danger. | `han bazawan gagavol em bamunx zamunx dogozom dul vevehel.` | [h-including \| [b-Azawan \| g-guard]] \| [used-by \| b-speaker-x] \| z-speaker-x \| [d-danger \| d-not] \| v-fear | covered |
| 180 | All her finery, lace, ribbons, and feathers, was packed away in a trunk. | `dual gerebam em balahen valagel al balagel.` | [d-everything \| g-embellishment] \| [used-by \| b-Alahen] \| v-carry \| [in \| b-luggage] | covered |
| 181 | Light he thought her, like a feather. | `zazawan vevegal darl zalahen thegatham zuel garagam humum bavevel.` | z-Azawan \| v-think \| d-that-clause \| [z-Alahen \| th-sake-met-any-term \| z-rank/less \| g-heavy] \| [h-like \| b-feather] | covered |
| 182 | Every spring and fall our cousins pay us a long visit. | `zobelx grebawol bobel grebazol bobel grebuwol bamunx huam huwem bual gahazum xal huwem bual gelevem hadaham damunx vowogalol.` | [[z-person-x \| [g-#-e1 \| [b-person \| [g-#-e0 \| [b-person \| [g-#-e-1 \| b-speaker-x]]]]]] \| h-always.open \| h-while \| [b-everything \| g-spring] \| x-and \| h-while \| [b-everything \| g-autumn] \| h-duration \| d-speaker-x \| v-attend] | covered |
| 183 | In our climate the grass remains green all winter. | `zual gegewol gegol hagem huwem bagazum am bogadem em bamunx.` | [z-everything \| g-greens] \| g-green \| h-still \| [h-while \| b-winter] \| [amid \| b-weather] \| [used-by \| b-speaker-x] | covered |
| 184 | The boy who brought the book has gone. | `zobohal thevom dugul valagel. zobohar thamom vuvudelum.` | z-boy \| th-MEMORY \| d-book \| v-carry . z-←boy \| th-RESIDUE \| v-go-recede | covered |
| 185 | These are the flowers that you ordered. | `zehon thevom davavulx vagegam. zavavurx om bamun thodom.` | z-listener \| th-MEMORY \| d-flower-x \| v-consumption . z-←flower-x-x \| [near \| b-speaker] \| th-LIVE | covered |
| 186 | I have lost the book that you gave me. | `zehon thevom dugul bamun vebel. zSELFn thamom dugur vadadum.` | z-listener \| th-MEMORY \| d-book \| b-speaker \| v-present . z-SELF \| th-RESIDUE \| d-←book \| v-loss | covered |
| 187 | The fisherman who owned the boat now demanded payment. | `zaxevehol thevom dobodal vegabem. zaxegaber thodom vern derl damol vebel.` | z-agent-x-fish \| th-MEMORY \| d-boat \| v-ownership . z-←agent-x-ownership \| th-LIVE \| v-command \| d-to-clause \| d-money \| v-present | covered |
| 188 | Come when you are called. | `yel vuvudel eol bamun huwem barl dehon vobozem.` | y-command \| v-go \| [toward \| b-speaker] \| [h-while \| b-that-clause] \| d-listener \| v-summons | covered |
| 189 | I shall stay at home if it rains. | `zSELFn thamam vahazam thoyem barl verehel.` | z-SELF \| th-plan-itinerary \| v-home \| [th-if \| b-that-clause] \| v-rain | covered |
| 190 | When he saw me, he stopped. | `zazawan thevom vazadal huwem barl zazawan thevom damun vahahal.` | z-Azawan \| th-MEMORY \| v-stop \| [h-while \| b-that-clause] \| z-Azawan \| th-MEMORY \| d-speaker \| v-see | covered |
| 191 | Do not laugh at me because I seem so absent minded. | `yul valavol ol bamun thevem barl zSELFn thunemehon gazaham gul.` | y-prohibition \| v-laugh \| [at \| b-speaker] \| [th-because \| b-that-clause] \| z-SELF \| th-CLUES-listener \| [g-attention \| g-not] | covered |
| 192 | I shall lend you the books that you need. | `zehon thodom dugulx volum. zSELFn thamam dugurx dehon vagawel.` | z-listener \| th-LIVE \| d-book-x \| v-necessity . z-SELF \| th-plan-itinerary \| d-←book-x \| d-listener \| v-lend | covered |
| 193 | Come early next Monday if you can. | `yel zehon thobam zuel bral vuvudel eol bamun huwem belagam grewol thoyem barl zehon vuvudexal.` | y-command \| [z-listener \| th-PATTERN \| z-rank/less \| b-later] \| v-go \| [toward \| b-speaker] \| [h-while \| [b-weekday \| g-1st]] \| [th-if \| b-that-clause] \| z-listener \| v-go-able | covered |
| 194 | If you come early, wait in the hall. | `yel vabazam al bexowogal thoyem barl zehon thobam zuel bral vuvudel.` | y-command \| v-wait \| [in \| b-scene-x-walk] \| [th-if \| b-that-clause] \| [z-listener \| th-PATTERN \| z-rank/less \| b-later] \| v-go | covered |
| 195 | I had a younger brother whose name was Antonio. | `zahaben thevom glemehel grebazol bamun. zahaben zSELFn zuel gebevam.` | z-Ahaben \| th-MEMORY \| gl-male \| [g-#-e0 \| b-speaker] . [z-Ahaben \| z-SELF \| z-rank/less \| g-age] | covered |
| 196 | Gnomes are little men who live under the ground. | `glemehel zobelx gamazam huam vahazam hadahel bagadol.` | [gl-male \| z-person-x \| g-small] \| h-always.open \| v-home \| [h-down \| b-ground] | covered |
| 197 | He is loved by everybody, because he has a gentle disposition. | `zual gobel dazawan valaval thevem barl zazawan gegehem.` | [z-everything \| g-person] \| d-Azawan \| v-love \| [th-because \| b-that-clause] \| [z-Azawan \| g-kindness] | covered |
| 198 | Hold the horse while I run and get my cap. | `yel dohozal vevedul. huwem barl zSELFn varahal dahodal em bamun valagel val.` | y-command \| d-horse \| v-fist . [h-while \| b-that-clause] \| z-SELF \| v-run \| d-cap \| [used-by \| b-speaker] \| [v-carry \| v-and] | covered |
| 199 | I have found the ring I lost. | `zSELFn thevom derehal vadadum. zSELFn thamom derehar vamagal.` | z-SELF \| th-MEMORY \| d-ring \| v-loss . z-SELF \| th-RESIDUE \| d-←ring \| v-find | covered |
| 200 | Play and I will sing. | `yel vebegam. xan zSELFn thamam vezehel.` | y-command \| v-play . x-and-then \| z-SELF \| th-plan-itinerary \| v-sing | covered |
| 201 | That is the funniest story I ever heard. | `zSELFn hoham thevom dozemx vewam. zozer zel galavom.` | z-SELF \| h-already \| th-MEMORY \| d-tale-x \| v-listening . [z-←scroll \| z-rank/more \| g-amusement] | covered |
| 202 | She is taller than her brother. | `zalahen glemehel zobel grebazol balahen zel gadavem.` | z-Alahen \| gl-male \| z-person \| g-#-e0 \| b-Alahen \| z-rank/more \| g-height | covered |
| 203 | They are no wiser than we. | `zazawanx zamunx zuel geladem.` | [z-Azawan-x \| z-speaker-x \| z-rank/less \| g-wisdom] | covered |
| 204 | Light travels faster than sound. | `zabawal zagawam zel hadehum vuvudel.` | [z-bright \| z-volume \| z-rank/more \| h-haste] \| v-go | covered |
| 205 | We have more time than they. | `zamunx zazawanx zel gral dadahal vegabem.` | [z-speaker-x \| z-Azawan-x \| z-rank/more \| g-amount] \| d-time \| v-ownership | covered |
| 206 | She has more friends than enemies. | `zanalobelx em balahen zobelx gavadam em balahen zel gral.` | z-friend-x \| [used-by \| b-Alahen] \| [[z-person-x \| g-struggle \| [used-by \| b-Alahen]] \| z-rank/more \| g-amount] | covered |
| 207 | He was very poor, and with his wife and five children lived in a little low cabin of logs and stones. | `zazawan thobam zuel wohahal gral thevom damol vegabem. zazawan thevom vahazam han bobel geveval gohoham bazawan han bahadolx g+5 al bahedel gamazam huwum buwul baragal bal.` | [z-Azawan \| th-PATTERN \| z-rank/less \| [w-ocean \| g-amount]] \| th-MEMORY \| d-money \| v-ownership . z-Azawan \| th-MEMORY \| v-home \| [h-including \| [b-person \| g-female \| [g-partnership \| b-Azawan]]] \| [h-including \| [b-child-x \| g-five.short]] \| [in \| [b-hut \| g-small]] \| [h-material \| [b-wood \| b-rock \| b-and]] | covered |
| 208 | When the wind blew, the traveler wrapped his mantle more closely around him. | `zaxowogal thobam zel hahagem thevom dogodul em baxowogar vebadom hugem baxowogar. huwem barl zewedul thevom vewedul.` | [z-agent-x-walk \| th-PATTERN \| z-rank/more \| h-comfort] \| th-MEMORY \| [d-coat \| [used-by \| b-←agent-x-agent-x-walk]] \| v-encapsulation \| [h-around \| b-←agent-x-agent-x-walk] . [h-while \| b-that-clause] \| z-wind \| th-MEMORY \| v-wind | covered |
| 209 | I am sure that we can go. | `zamunx thunel vuvudexal.` | z-speaker-x \| th-CLUES.strong \| v-go-able | covered |
| 210 | We went back to the place where we saw the roses. | `zamunx thevom dorozalx vahahal ol bahedem. zamunx thevom vuvudel habagal eol baheder.` | z-speaker-x \| th-MEMORY \| d-rose-x \| v-see \| [at \| b-locality] . z-speaker-x \| th-MEMORY \| v-go \| h-back \| [toward \| b-←hut] | covered |
| 211 | "This tree is fifty feet high," said the gardener. | `zaxahabol thevom d[zedehul gadavem bezezem g+15 om bamun] vezebel.` | z-agent-x-house-plant \| th-MEMORY \| d-CITE[[z-tree \| [g-height \| [b-meter \| g-15]]] \| [near \| b-speaker]] \| v-tell | covered |
| 212 | I think that this train leaves five minutes earlier today. | `zSELFn vevegal darl zedehal om bamun thobam zuel bral bavegam g+5 huwem bazazam om bamun vuvudelum.` | z-SELF \| v-think \| d-that-clause \| [[z-train \| [near \| b-speaker]] \| th-PATTERN \| z-rank/less \| b-later] \| [b-minute \| g-five.short] \| [h-while \| [b-day \| [near \| b-speaker]]] \| v-go-recede | covered |
| 213 | My opinion is that the governor will grant him a pardon. | `zSELFn vevegal darl zaxagayel thunem bral dazawan vebezem.` | z-SELF \| v-think \| d-that-clause \| z-agent-x-crown \| [th-CLUES \| b-later] \| d-Azawan \| v-forgiveness | covered |
| 214 | Why he has left the city is a mystery. | `vebezom dorl zazawan thamom vuvudelum ul bezagal thevem bar.` | v-mystery \| d-whether-clause \| z-Azawan \| th-RESIDUE \| v-go-recede \| [from \| b-skyline] \| th-because \| b-something | covered |
| 215 | The house stands where three roads meet. | `zorodalx g+3 vezedem. zahazal thodom vazadol al bezeder.` | [z-road-x \| g-three.short] \| v-hub . z-house \| th-LIVE \| v-stand \| [in \| b-←station] | covered |
| 216 | He has far more money than brains. | `zamol em bazawan zebeham em bazawan zel wohahal gral.` | z-money \| [used-by \| b-Azawan] \| [[z-intellect \| [used-by \| b-Azawan]] \| z-rank/more \| [w-ocean \| g-more-than-one]] | covered |
| 217 | Evidently that gate is never opened, for the long grass and the great hemlocks grow close against it. | `zoyel thunel voyel hal thevem barl zegewol geregam zedehulx gelavam zal vuzem om boyer.` | z-door \| th-CLUES.strong \| v-open \| h-never \| [th-because \| b-that-clause] \| [[z-greens \| g-length] \| [z-tree-x \| g-big] \| z-and] \| v-growth \| [near \| b-←open] | covered |
| 218 | I met a little cottage girl; she was eight years old, she said. | `zSELFn thevom degehal gamazam gagedom vezedem. zegehar thevom d~[zegehar bavawem g+8 gebevam] vezebel.` | z-SELF \| th-MEMORY \| [d-girl \| g-small \| g-rural] \| v-hub . z-←girl \| th-MEMORY \| d-CITE.about[z-←girl \| [b-year \| g-eight.short \| g-age]] \| v-tell | covered |

### Notes

- **STC-1–10, *the sun*:** a full-root resume `zazaher` with no antecedent is *the one we both know*, which fits a unique referent. No article gap.
- **STC-1:** read as a plain report. A general truth (*the sun shines, as a rule*) would add *always* `hual`.
- **STC-2–7, tense:** by design (no tense letter). The progressive is LIVE, the past is MEMORY, and the future is a channel + `bral`. *Tomorrow* is the day offset +1 on that channel. Each forecast has to choose a warrant; PATTERN is the honest one for sunrise.
- **STC-5, *has been shining*:** *still* `hagem` carries "began earlier, goes on now". The English duration-up-to-now is only implied; a measured duration would need a measure phrase.
- **STC-10, *now*:** LIVE already means "in view now" and takes no zero offset, so there is no separate *now* word.
- **STC-8:** with `v:shine` on *bright*, `habawal vabawal` reads *shines brightly*, like the English.
- **STC-11–13, *the people*:** `zual gobel` with no place hook is every person the situation is about. *Some of* / *many of* resume the known group (`zoberx`) and give the amount, per the denominator recipe; *many* names the Typical bar.
- **STC-15–20, *kitten*:** a live compound, *baby* `x` *cat* (`ebebexagada`); later mentions resume it in full.
- **STC-17, 26, 31, 33, *away*:** hook compound with `um` (*recede*) on the motion verb: `vowogalum`, `vuvudelum`, `vewawelum`, `vemehulum`.
- **STC-19, 21:** *came down* is *fall*; *has stopped* is *no longer* `hewem` (the rain no longer falls), so no *stop* verb is needed.
- **STC-24, *once*:** FORMER `thenom` (a past climate, not today's). *Here* is `om bamun`.
- **STC-28, *should*:** prescription with the unnamed sake, `thegathem`. **STC-37, *must*:** `thumem`.
- **STC-29, *happy to*:** emotion compose on `/th/`: pleasure met, INTERNAL, FLOWING (`thozothamam`) — the speaker's own feeling, so no holder is needed.
- **STC-33, *probably*:** stance number `thral` (*likely*, no figure).
- **STC-38, *opposite*:** `honovathahan` — in front, as the two of us face. *Directly* is dropped.
- **STC-45, *village*:** *hut* in its abstract sense, `bahedem` (*locality*). *For a visit* is `hogom` + the *attend* compound as a noun.
- **STC-47, *wait for you*:** the awaited person is the object.
- **STC-50, *her father*:** kin number `grebuwol` (the layer above) + `/b/` the child, with *male* before it. Long, but every piece is taught.
- **STC-51, *oldest girl in the village*:** superlative `zegehal zel gebevam`; the group in play is set by the clause-level *in the village* hook. *Yesterday* is the day offset −1 on MEMORY.
- **STC-52–56, 59, 73, 97, 99, questions:** no channel under `yol` where *did* / *are … coming* read from the bare verb. A question about intent takes PLAN (STC-56 *can you come tomorrow*). A forecast in a question puts a channel under `yol`, which asks for the listener's warrant (STC-73, 97: CLUES + `bral`). *Ready* in STC-97 is the verb *prepare* (`vabam`), since `gabam` is *before*.
- **STC-52, *this village*:** `al bahedem om bamun`: a hook + `/b/` right after a landmark describes it (*the village near me*).
- **STC-53, 55, *your brother / sister*:** sibling kin `grebazol` + `/b/` listener, with *male* / *female* before. **STC-89, 93, *father*, *his boy*:** `grebuwol` / `grebawol` on the kin anchor.
- **STC-57, *neighbors*:** agent compound on *home* (`zaxahazamx`) + *near us*. *Gone away* keeps RESIDUE (they are still away). *Winter* is the *gloves* abstract (`bagazum`).
- **STC-58, 91, *robin*:** compound *red* `x` *bird* (`eredaxebedu`); the habit question is an open universal `zuam`.
- **STC-59, *concert*:** scene compound on *sing* (`bexezehel`, a sing-event). *With us* (not the listener) is `han bamunx`. **STC-63, 72, 92:** narrative *we* that leaves the listener out is `zamunx`, not `zahan`.
- **STC-60, *ever*:** `hoham … har`. *Travel* is `vehebam` (*voyage*). *Jungle* is the compound *palm* `x` *tree* (`babahuxedehulx`).
- **STC-61, *several miles*:** metric, not miles: `bezezem grabarem` (*thousands of meters*, about). *Down* the river is dropped.
- **STC-62, *knows*:** the *book* abstract as a verb (`vugum`); *about* is `hahehom`. *Everybody* is open `zuam` (as far as I know). *Hunting* stays *predation* (`buwuvam`); the verb *hunt* is `varehel`, role English on *archery*.
- **STC-63, *solstice*:** compound *sun* `x` *stop* (`bazahexazadal`). *Started for* is the hook compound *go* + *toward* (`vuvudeleol`).
- **STC-63, 71, 74, 76:** fronted place phrases (`aol bamadal …`, `am begevel …`) now parse as extra-noun hooks (parser fix; see results).
- **STC-64, *the monkey's tricks*:** two sentences, then an event resume (`bedevar`), the recipe for an act as someone's (say-people-places.md § someone's act).
- **STC-66, *was hidden by*:** object first, then the hider as subject. *Boughs* is *tree* `x` *bone* (`zedehuxobolx`).
- **STC-67, *spring sun*:** the time pole on the noun, `guwem bahazum` (*during spring*).
- **STC-68, *wreaths … on their heads*:** *wreath* is the compound `bavavulagayelx`. *On their heads* is dropped: a hook + `/b/` after the wreath (`aol behedalx`) would split the *many* rank from its noun. *Head* is `behedal`.
- **STC-70, *in the line*:** dropped; the ordinal already says the order.
- **STC-71, *lived*:** NOTIONAL `thavom`, since this is story narration; later sentences of the tale carry it forward.
- **STC-73, *your guests*:** people cannot take `em`, so *guests* is the *hospitality* tie (`gabubam behon`); *from the city* goes before the noun with `gl-`, since two relation adjectives cannot follow one noun.
- **STC-74, *sharply*:** `hanavam` (*severity*, the knife abstract). *Course turns* is `verevem` (*turn*, the abstract on *refresh*).
- **STC-75, 76, 78, 79:** an `/h/`-hosted `/b/` now keeps its adjectives (`hazam bamadalx gradul gadavem`, `humum bamezal gazahum`; parser fix).
- **STC-82, 94, *happy*:** emotion compose, pleasure met, INTERNAL, FLOWING (`thozothamam`). Someone else's feeling takes a holder (STC-88 `thunemegehar`, STC-94 `thodomoberx`); a holder can be a full-root resume, and a group takes **-x** (*those people*).
- **STC-83, *these oranges*:** full-root resume (the ones we both see) plus *near me*; a new noun would read as *there are juicy oranges here*.
- **STC-84, *sea water is salty*:** `zuam` + kind + `/ɡ/` is a property of every member, as a rule (exceptions not listed).
- **STC-85, *full of people*:** approximated as *many people in the streets* (Typical bar). *Streets* is *road* (`borodalx`).
- **STC-86, 87, *tastes / feels*:** the sense is the channel: LIVE for a present touch, PATTERN for a general taste. *Sugar* is the *candy* abstract (`gagedem`).
- **STC-89, *had once been*:** FORMER `thenom`. The predicate *sailor* sits between the noun and the kin relation, so it describes the father, not the boy.
- **STC-95, *Monday*:** *first weekday* (`zelagam grewol`, counting from Monday) under LIVE for *today*.
- **STC-65, 69, 72, 76, 77, 79, 80, 144, new words:** *fence* `buwulagezal`, *floor* `bahazalagadol`, *field* `bevedalx`, *wheat* `begevel` (*grain*), *oak* `banedoledehulx`, *ground* `bagadol`, *face* `bevezal`, *summer* `bazegem`.
- **STC-72, 79, 96, new rows:** *country* is `bagedom` (*rural*), *caress* is *hug* (`bahagel`), *leaves* is `gelevol`.
- **STC-98, a polite request:** English *Will you … for me?* is a request, so it takes soft request `yem`; *for me* is proxy `hadem`.
- **STC-100, *first of the litter*:** eldest sibling `g#1e0`.
- **STC-101, 115, *these shoes* / *this tree*:** full-root resume only. `om bamun` before a rank join or a fill-ask list would make the next `/ɡ/` words describe the speaker (the landmark). *Too big for you* is the unspecified sake bar with the listener in its `/b/` as whose stake (`thegatham behon`).
- **STC-102, *how wide*:** `wrar` on *width* (`gegodem`, the *accordion* abstract).
- **STC-103–108, commands:** *listen* is the *ear* abstract as a verb (`vewam`), not *hear* (`vewal`). *Keep this secret* is *keep confidential* (`vaheham`, the *hush* abstract) with `darth` for *this*; *until tomorrow* is a signed day count in the pole's `/b/` (`homam bazazam grawol`), counted from now. *Be careful* is `yel geyayem`, a command with only a `/ɡ/` body. *Come* / *bring … with you* is `vuvudel` + `han` (company); with a place, `eol bamun`.
- **STC-90, *blanket*:** the *yarn* abstract (`dayaham`). **STC-134, *too short*:** less *length* (`geregam`, the *railcar* abstract). **STC-142, *threw … lake*:** `vubuhal` (role English on *boomerang*) and `bagawom` (the *canoe* abstract).
- **STC-109, *have some tea*:** an offer, so soft request `yem`; `gral` on a mass noun is *some*. The verb is `vedeyol` (*drink*).
- **STC-110, 111, *friends* / *brother and sister*:** the tie or kin word is SHARED after the join with no `/b/`, so *of each other* is only implied (G-17). *His dog* is a hook + `/b/` right before the join word (`zodogal em bazawar zal`, G-18).
- **STC-112, *go together*:** PLAN plus collective **-x** on the verb.
- **STC-113, *all the doors and windows*:** two *every K* clauses, since a kind join after `dual` does not read as one kind. *Open* is `voyel` (role English on *door*).
- **STC-114, 118, 130, 148, *but*:** the linker `xagezam` starts a second sentence. *Small but strong*, *tired but happy*: the first claim sets an expectation the second blocks.
- **STC-116, *the sky … look*:** *sky* (`zagavum`, the *cloud* abstract) and *gray* (`gegeval`); *look* is LIVE, as *feels* was in STC-87. The choice is a fill-ask over the two colors (`?gar`).
- **STC-117, 131, 150, kin:** *father or mother* is the parent layer with no mantissa (`grebuwol`, one member). *Uncle* is a male sibling of a parent. *Mother* is `geveval` before the kin number.
- **STC-119, *played a tune on*:** *perform* (`vamum`) with the flute as a tool (`ael`); `em bazawar` follows the flute's adjective, as in hooks.md § Whose.
- **STC-120, *toward the end of August*:** *near 31 August* (`om b_#31,8`). *The days grow much shorter* is *much less duration than usual* on PATTERN.
- **STC-121, *company of soldiers marched*:** *guards* (💂) walking as one act (`vowogalx`). The fronted *over the hill* keeps the two extras apart.
- **STC-122, *the first part of the story*:** *the beginning* (`zabeger`, a full-root resume), with *interesting* (*curiosity*) before the relation so it describes the beginning, not the story.
- **STC-123, *crow*, *pitcher*, *brim*:** *black* `x` *bird*, *amphora*, *the top part of it*. *Dropped* is *fall* with an object.
- **STC-124, *in glee*:** SHARED `/h/` after a verb join covers both verbs. The manner is observable, so no holder is needed.
- **STC-125, *stop … and be quiet*:** *no longer play* (`hewem vebegam`), then *be quiet* as a `/ɡ/`-only command clause (`gezebom`) in a clause join under the same command.
- **STC-126, *louder and louder*:** *rose in volume* (`hagawam vabedel`, the uptrend verb).
- **STC-127, *better*:** `?der` asks which ranks first. *Summer* is the *ice-cream* abstract (`dazegem`).
- **STC-128, 139:** *will* is CLUES + `bral`; *too late* is a sake bar, `thegatham zel bral`.
- **STC-129, 132, 142:** a string of acts by one subject is `xan` with a resumed subject, since verb-join items cannot carry their own objects (G-19).
- **STC-133–137, interjections:** `/y/` + **-n** on the matching root: *aha* is *insight* (`yaleden`), *oh dear* is *worried* (`yewedan`), *alas* is *cry* (`yagahun`), *whew* is *phew* (`yuvuyun`). *Indeed* and the English *!* are the `!` tone mark.
- **STC-136, *that news is sad*:** the speaker's feeling on a noun they do not own, so emotion compose on `/w/` + `gobum`.
- **STC-138, *warm enough now*:** the unspecified sake bar's tie on *hot*, and INTUITION with a zero offset asks what the listener's body says now.
- **STC-140, *a brave people*:** reduced to *we are brave*.
- **STC-143, 144:** story narration, so NOTIONAL. *Outside the door* is *at the door*.
- **STC-145, *our bird's name is Jacko*:** two sentences, since `gugol` after `em bamunx` would describe the speaker group.
- **STC-146, *the way to the sea*:** *road* with *toward the sea*.
- **STC-147, *on the wing*:** *flier* (agent compound on *wing*).
- **STC-149, *rooms*:** scene compounds on *chair*, *sleep*, and *cooking*. *Had three rooms* is an existence list SHARED as *part of the little house*; the count is the list.
- **STC-151, 182, *each day* / *every spring and fall*:** a counted unit is a count per unit (`hrawol hruwol bazazam`, once per day); named seasons are a universal kind in the time pole (`huwem bual gahazum`). *Something new* is `dar` (an unnamed new thing) plus *news* (`gunuzem`).
- **STC-152, *market*, *minutes*, *this week*:** *market* is the new abstract on 🏬 (`zozodom`, L-09). *Minute* is the new stock unit `bavegam` (L-10). *This week* is the full-root resume `bagadar` plus `om bamun`, which describes the week ([hook + `/b/` on a landmark](../grammar/hooks.md)). *Earlier* is the `bral` scale against the *Usual* bar.
- **STC-153, *find … too great*:** *distance* is *length* (`zeregam`). MEMORY under `yol` asks for the listener's own warrant, as in STC-97.
- **STC-154, 155, 164, address:** *children* is a kind vocative with **-x** (`yahadolx`). *Madam* and *my son* are the listener (`yehon`); the title and the kin word are dropped.
- **STC-155, *obey*:** `vuyoyum` (the *conformity* abstract). *Command* is dropped; `vern` states a command as content, but here the act is the obeying.
- **STC-156, *here under this tree*:** `hadahel` + landmark is *under* (roles.md § gravity). *Feast* is a wonderful *bento* (`debedol gezum`), *gave* is `vebel` (*present*), and *their guests* is the *hospitality* tie with a resume (`bobelx gabubam boberx`).
- **STC-157, *in winter … at night*:** two `huwem` poles, with COMMON for the routine. *Candlelight* is *using a yellow candle* (`geyayel`); *get up* is `vabahal` (*up*), *dress* is `vedezal`.
- **STC-158, *last part*:** *the end* (`deveham`, the *finish-line* abstract) of the tale, as in STC-122.
- **STC-159, 160, *or*:** `xol` between clauses. In 159 the second clause is the rank claim *later than needed* with the verb *arrive*, so the threat is the outcome, not a forecast.
- **STC-161, *shabby*, *ragged*, *uncomfortable*:** three claims. *Shabby* and *ragged* are *breakdown* (`galazem`, as *broken* in STC-41), with `welavam` on the second; *uncomfortable* is *not comfortable* (`gahagem gul`) placed before the *cold days* pole so the `/w/` word stays on the adjective.
- **STC-162, *think first and then act*:** verb join `xan` (*and then*). *Act* is *effort* (`vozewem`).
- **STC-163, *a little mite of a girl*:** an aside with a resume of the speaker (`th(zSELFr gegehal gamazam)`). *Falling* is the agent compound on *down* (`gaxadahel`).
- **STC-164, *show … tell*:** *show* is CAUSE with the listener as causer (`thegem behon`): the guests are the subject of *see*. *History* is *tale*, and *strange* is the *alien* abstract (`gelehom`).
- **STC-165, *nothing but*:** the single-item **-l** join is *just* ([joins](../grammar/joins.md)): `ol bozewem em behon bal` is *at only your effort*. *Best* is *effort*.
- **STC-166, *consider … faithful friends*:** `darl` and a second sentence. *Faithful* is the *loyalty* abstract on *dog* (`godogam`).
- **STC-167, *make this place our home*:** *make* (`vameval`) with `el` (*for*) and *home* (`bahazam`, the *house* abstract), owned by us with `em`. *This place* is *locality* plus `om bamun`.
- **STC-168, *warm and snug … soft moss*:** *warm* is *quite hot* (`wadeham gahadul`), *snug* is *comfort*, *moss* is *herb* (`bebahel`); *soft* is dropped. The noun join `bal` closes *herb and leaf*, both under `ael`.
- **STC-169, 174, 176, *-self* as *unaided*:** the single-item **-l** join is *just* ([joins](../grammar/joins.md)): `zegehal gamazam zal` is *only the little girl*, so nobody else did it. It also gives *alone* (STC-176).
- **STC-170, 171, 173, 175, reflexives:** a resume in the object or recipient slot points back at the subject ([pronouns](../grammar/pronouns.md#resume-r)). *Ashamed of myself* is unmet relatedness aimed at oneself (`thanathumom bSELFr`). **STC-172:** *proved* is the *proof* abstract as a verb (`verazem`).
- **STC-177, *embroidered*, *princess*:** no subject, with *sew* from *needle* (`venedal`). *Princess* is *small girl* with *leadership* (`gagayem`). *National flower of the Country* is a second sentence: `gobom bagul` (*country*, 🗾).
- **STC-178, *symbol of liberty*:** *symbols* (`gezezul`) with *about* (`gahehom`) and the *liberty* abstract on *statue*.
- **STC-179, *with him as our protector*:** `han bazawan gagavol em bamunx` (including Azawan the guard). *No danger* is `dogozom dul`.
- **STC-180, *finery … packed*:** *finery* is *embellishment*; lace, ribbons, and feathers are dropped. *Trunk* is *luggage* (`balagel`), *packed away* is *carry* (`valagel`), and the subject is left out.
- **STC-181, *light … like a feather*:** `darl` and a second sentence. *Light* is *less heavy than the unspecified sake bar* (`thegatham zuel garagam`).
- **STC-182, *cousins*, *long visit*:** cousin is a child of a sibling of a parent: three kin anchors (`grebawol bobel grebazol bobel grebuwol bamunx`). *Long* is `hadaham`; *pay a visit* is *attend* with the visited as object.
- **STC-183, *climate*, *remains*:** `zual` + kind + `/ɡ/` is a property of every member (STC-84); *remains* is `hagem`; *climate* is *weather* (`bogadem`).
- **STC-184–187, relative clauses:** two sentences with a resume. *Brought* is *carry*; *ordered* is *consumption* (`vagegam`, from *cart*), so *bought*. **STC-187:** the fisherman's own event comes first (`vegabem`, *own*), then the doer resume `zaxegaber` ([roles](../grammar/roles.md#this-instance-r)), and *demanded payment* is `vern` with *money given*.
- **STC-188–190:** `huwem barl` is *when*, `thoyem barl` is *if*. *Stop* is `vazadal`; *called* is *summoned* (`vobozem`).
- **STC-191, *seem*:** the holder seam names the listener (`thunemehon`, *as you see it*), so the speaker never states the impression as plain fact. *Absent-minded* is *not attentive* (`gazaham gul`).
- **STC-192, *lend*, *need*:** *lend* is role English on *credit-card* (`vagawel`); *need* is the *necessity* abstract as a verb (`volum`). Two sentences with a book resume.
- **STC-193, 194, *early*, *Monday*:** *early* is the PATTERN bar, `thobam zuel bral` (G-03); the bar needs a ranked item, so the listener is named; *next Monday* is the weekday ordinal under `huwem` (G-14). *Hall* is the scene compound on *walk* (`bexowogal`).
- **STC-195, *name was Antonio*:** the name is a house-cast name (`zahaben`), not a foreign payload. *Younger* is the rank on *age*, said as its own sentence.
- **STC-196, *gnomes*:** no gnome root; *little men* under `hadahel bagadol` (*down* on the ground), with COMMON for the habitual claim. *Under* has no hosted relation of its own.
- **STC-197, *loved by everybody*:** object first, then the lover as subject; *gentle* is *kindness* (`gegehem`) under the because pole.
- **STC-198, 199, *hold*, *find*:** *hold* is *seize* (`vevedul`); *find* is role English on *magnify* (`vamagal`, L-12). *Run and get my cap* is a verb list closed by `val` (G-19).
- **STC-201, *funniest*:** *hear* is the *listening* abstract; *story* is the *tale* abstract, and `zozer` is *that one* with the superlative bar.
- **STC-202, 206, 216, comparatives:** the second name is a full noun phrase (`glemehel zobel grebazol balahen`). *Enemies* is *people of struggle* (`gavadam`). *Far more* is `wohahal` on the amount scale, as in comparatives.md.
- **STC-203, *no wiser than*:** the whole comparison denied with a **u** join (`zel gamadam zul`: below or tied), not reverse rank `zuel`, which is *not as … as* (comparatives.md § Intermediate; G-23). The English implication that neither is wise is not said.
- **STC-204, *faster*:** the manner scale, `hadehum` (*haste*). *Light* is `zabawal` (*bright*); *sound* is *volume* (`zagawam`).
- **STC-207, *very poor*:** *far fewer than typical* on the amount of money owned. *Wife* is a female partner tie (`gohoham`), and the two `han` hooks keep *his wife* and *five children* apart. *Cabin* is *little hut*; *low* is dropped; *of logs and stones* is `huwum` with a join.
- **STC-208, *mantle*, *closely*:** *mantle* is *coat*; *traveler* is the agent compound on *walk*. *More closely* is approximated as *more snugly* (`hahagem`), as in STC-168.
- **STC-209, *sure*:** a strong CLUES channel (`thunel`), the *-l* ending being solid evidence.
- **STC-210, 215, *the place where*:** name the place, then resume it in the next sentence (dependents.md § which noun). *Meet* is the *hub* abstract as a verb (`vezedem`), and the road event is resumed as `bezeder`.
- **STC-211, *fifty feet*:** metric, `bezezem g+15` after the scale adjective, as in say-amounts.md. *Gardener* is the agent compound on *tending*. The quote is an exact cite.
- **STC-212, 213, *I think*:** `vevegal darl`. *My opinion is that* is said as *I think that*; *governor* is the agent compound on *leadership*, *pardon* is *forgive* (`vebezem`).
- **STC-214, *why he has left*:** a reported *why* is the `thevem bar` blank inside `dorl` ([reported questions](../grammar/say-questions.md#reported-questions)); *mystery* is the abstract as a verb (`vebezom`) with that clause as its object, so the English subject clause becomes an object.
- **STC-217, *never*, *evidently*:** `hal` is the *never* restrictor; *evidently* is the strong CLUES channel. *Gate* is *door*, and `boyer` binds the door noun, though its nearest same-root word is the verb.
- **STC-218, *cottage girl*:** *little rural girl*; *she said* is a paraphrase cite (`d~[…]`) with the age as a measure on *year* (`bavawem g+8`).

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
