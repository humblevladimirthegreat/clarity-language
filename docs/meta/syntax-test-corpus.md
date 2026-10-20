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
3. If the English puts a feeling, belief, want or other stance on **someone other than the speaker** (*she was hurt*, *he thinks*, *it makes sense that you feel*), it is almost never a gap. This has been logged as one several times. Name that person as the holder on the channel, MAY or NOTIONAL word that gives you access to their view (`theyemuzozen`, `thebamawan`, `theyeleyor`: [whose view](../grammar/knowing.md#holder)). For a stance **on** their stance, put your stance in the main sentence and theirs in a dependent with its own holder seam word, naming what their feeling is about (`wowotham goyem zarl zevur wawothumam goyem theyemawan`).
4. Record the phrases you tried in the gap row.

Every Agebon line below was checked with `node scripts/parse.mjs`.

## Translations

| STC | English | Agebon | Morph gloss | Verdict |
|-----|---------|--------|-------------|---------|
| 1 | The sun shines. | `zuzaler vabulol.` | z-←sun \| v-shine | covered |
| 2 | The sun is shining. | `zuzaler thugom vabulol.` | z-←sun \| th-LIVE \| v-shine | covered |
| 3 | The sun shone. | `zuzaler thevum vabulol.` | z-←sun \| th-MEMORY \| v-shine | covered |
| 4 | The sun will shine. | `zuzaler thubem blral vabulol.` | z-←sun \| [th-PATTERN \| b-later] \| v-shine | covered |
| 5 | The sun has been shining. | `zuzaler thugom hawum vabulol.` | z-←sun \| th-LIVE \| h-still \| v-shine | covered |
| 6 | The sun is shining again. | `zuzaler thugom hurugem vabulol.` | z-←sun \| th-LIVE \| h-again \| v-shine | covered |
| 7 | The sun will shine tomorrow. | `zuzaler thubem bluzurem grawol vabulol.` | z-←sun \| [th-PATTERN \| [b-day \| g-one]] \| v-shine | covered |
| 8 | The sun shines brightly. | `zuzaler habulol vabulol.` | z-←sun \| h-bright \| v-shine | covered |
| 9 | The bright sun shines. | `zuzaler gabulol vabulol.` | [z-←sun \| g-bright] \| v-shine | covered |
| 10 | The sun is rising now. | `zuzaler thugom vayuhem.` | z-←sun \| th-LIVE \| v-rise | covered |
| 11 | All the people shouted. | `zual geyol thevum vazuwal.` | [z-everything \| g-person] \| th-MEMORY \| v-shout | covered |
| 12 | Some of the people shouted. | `zeyorx gram thevum vazuwal.` | [z-←person-x \| g-more-than-one.about] \| th-MEMORY \| v-shout | covered |
| 13 | Many of the people shouted twice. | `zeyorx thubem zel gral thevum vazuwal hradul.` | [z-←person-x \| th-PATTERN \| z-rank/more \| g-amount] \| th-MEMORY \| v-shout \| h-two | covered |
| 14 | Happy people often shout. | `zeyolx gugemam thubem zel hral vazuwal.` | [[z-person-x \| g-delight] \| th-PATTERN \| z-rank/more \| h-how-often] \| v-shout | by design (G-01) |
| 15 | The kitten jumped up. | `zeboyexagozor thevum vugazal hayuhem.` | z-baby-x-cat \| th-MEMORY \| v-jump \| h-rise | covered |
| 16 | The kitten jumped onto the table. | `zeboyexagozor thevum vugazal aol bexagedal.` | z-baby-x-cat \| th-MEMORY \| v-jump \| [on \| b-scene-x-cutlery] | covered |
| 17 | My little kitten walked away. | `glamezom zeboyexagozol em buwon thevum vowurelum.` | [gl-small \| z-baby-x-cat] \| [used-by \| b-speaker] \| th-MEMORY \| v-recede | covered |
| 18 | It's raining. | `thugom verulal.` | th-LIVE \| v-rain | covered |
| 19 | The rain came down. | `zerulal thevum vaduhel.` | z-rain \| th-MEMORY \| v-fall | covered |
| 20 | The kitten is playing in the rain. | `zeboyexagozor thugom veyaham am berulal.` | z-baby-x-cat \| th-LIVE \| v-play \| [amid \| b-rain] | covered |
| 21 | The rain has stopped. | `thugom huvum verulal.` | th-LIVE \| h-no-longer \| v-rain | covered |
| 22 | Soon the rain will stop. | `theyem blrabum huvum verulal.` | [th-CLUES \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 23 | I hope the rain stops soon. | `thoguyem theyem blrabum huvum verulal.` | th-hope \| [th-CLUES \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 24 | Once wild animals lived here. | `zulazulx gulazum om buwon helam vaheham.` | [z-leopard-x \| g-nature] \| [near \| b-speaker] \| h-FORMER \| v-home | covered |
| 25 | Slowly she looked around. | `huzezam zolazun thevum vazebom ol bual.` | h-slow \| z-Olazun \| th-MEMORY \| v-look \| [at \| b-everything] | covered |
| 26 | Go away! | `yel vavobelum.` | y-command \| v-go-recede | covered |
| 27 | Let's go! | `yem zayan vavobel.` | y-request \| z-interlocutors \| v-go | covered |
| 28 | You should go. | `zawan vavobel thudathem.` | z-listener \| v-go \| th-sake-ought-offered | covered |
| 29 | I will be happy to go. | `zuwon thagem vavobel thodothamam.` | z-speaker \| th-plan-itinerary \| v-go \| th-pleasure-met-any-term-INTERNAL-FLOWING | covered |
| 30 | He will arrive soon. | `zuzozen theyem blrabum vovurel.` | z-Uzozen \| [th-CLUES \| b-+-e-.about] \| v-arrival | covered |
| 31 | The baby's ball has rolled away. | `zulovol em beboyel haram vewovelum.` | z-ball \| [used-by \| b-baby] \| h-RESIDUE \| v-wheel-recede | covered |
| 32 | The two boys are working together. | `zuboyelx gradul thugom vuzubamx.` | [z-boy-x \| g-two] \| th-LIVE \| v-effort-x | covered |
| 33 | This mist will probably clear away. | `zovulul om buwon thral theyem blral vumemulum.` | z-fog \| [near \| b-speaker] \| th-likely \| [th-CLUES \| b-later] \| v-melt-recede | covered |
| 34 | Lovely flowers are growing everywhere. | `zuvelalx gahelam thugom velem ol bual.` | [z-flower-x \| g-beauty] \| th-LIVE \| v-growth \| [at \| b-everything] | covered |
| 35 | We should eat more slowly. | `zayan thubem zel huzezam vagedal thudathem.` | [z-interlocutors \| th-PATTERN \| z-rank/more \| h-slow] \| v-eat \| th-sake-ought-offered | covered |
| 36 | You have come too soon. | `zawan thudatham zuel bral vavobel oel buwon.` | [z-listener \| th-sake-met-any-term \| z-rank/less \| b-later] \| v-go \| [toward \| b-speaker] | covered |
| 37 | You must write more neatly. | `zawan thubem zel hozebum varayel thonam.` | [z-listener \| th-PATTERN \| z-rank/more \| h-cleanliness] \| v-write \| th-REQUIRE-demanded | covered |
| 38 | Directly opposite stands a wonderful palace. | `honuhethayan zugahul gemom vawuvol.` | h-north-th-interlocutors \| [z-castle \| g-amazement] \| v-stand | covered |
| 39 | Henry's dog is lost. | `zudozol gudurum em buzozen.` | [z-dog \| g-loss] \| [used-by \| b-Uzozen] | covered |
| 40 | My cat is black. | `zagozol gubulol em buwon.` | [z-cat \| g-black] \| [used-by \| b-speaker] | covered |
| 41 | The little girl's doll is broken. | `zeneval golahum em bagoyel gamezom.` | [z-nesting-doll \| g-breakdown] \| [used-by \| [b-girl \| g-small]] | covered |
| 42 | I usually sleep soundly. | `zuwon huam vezuvol hanedum.` | z-speaker \| h-always.open \| v-sleep \| h-depth | covered |
| 43 | The children ran after Jack. | `zahoyelx thevum dahelan vohunem.` | z-child-x \| th-MEMORY \| d-Ahelan \| v-pursuit | covered |
| 44 | I can play after school. | `zuwon veyahaxam halam bluzahal.` | z-speaker \| v-play-able \| [h-after \| b-school] | covered |
| 45 | We went to the village for a visit. | `zayan thevum vavobel oel behaham hovam blowurelol.` | z-interlocutors \| th-MEMORY \| v-go \| [toward \| b-locality] \| [h-so-that \| b-attend] | covered |
| 46 | We arrived at the river. | `zayan thevum vovurel ol bowulal.` | z-interlocutors \| th-MEMORY \| v-arrival \| [at \| b-drinking-water] | covered |
| 47 | I have been waiting for you. | `zuwon thugom hawum dawan vobahem.` | z-speaker \| th-LIVE \| h-still \| d-listener \| v-wait | covered |
| 48 | The campers sat around the fire. | `zaxagahalx thevum vuhohol hevam blavulul.` | z-agent-x-camp-x \| th-MEMORY \| v-sit \| [h-around \| b-fire] | covered |
| 49 | A little girl with a kitten sat near me. | `glamezom zagoyel gan bleboyexagozol thevum vuhohol om buwon.` | [gl-small \| z-girl \| [g-including \| b-baby-x-cat]] \| th-MEMORY \| v-sit \| [near \| b-speaker] | covered |
| 50 | The child waited at the door for her father. | `zahoyer thevum vobahem ol bohol glemugol deyol grebuwol blahoyer.` | z-←child \| th-MEMORY \| v-wait \| at \| b-door \| gl-male \| d-person \| g-#-e-1 \| b-←←child | covered |
| 51 | Yesterday the oldest girl in the village lost her kitten. | `zagoyel zel guburem al behaham thevum bluzurem gruwol deboyexagozol em bagoyer vudurum.` | [z-girl \| z-rank/more \| g-age] \| [in \| b-locality] \| [th-MEMORY \| [b-day \| g-minus-one]] \| d-baby-x-cat \| [used-by \| b-←girl] \| v-loss | covered |
| 52 | Were you born in this village? | `yol ? zawan al behaham om buwon vavol.` | y-question \| ? \| z-listener \| [in \| b-locality] \| [near \| b-speaker] \| v-hatch | covered |
| 53 | Can your brother dance well? | `yol ? glemugol zeyol grebazol blawan vanurexal hubedom.` | y-question \| [? \| gl-male \| z-person \| [g-#-e0 \| b-listener]] \| v-dance-able \| h-excellence | covered |
| 54 | Did the man leave? | `yol ? zomuyer velurul.` | y-question \| ? \| z-←man \| v-departure | covered |
| 55 | Is your sister coming for you? | `yol ? glevugol zeyol grebazol blawan vavobel oel bawan.` | y-question \| [? \| gl-female \| z-person \| [g-#-e0 \| b-listener]] \| v-go \| [toward \| b-listener] | covered |
| 56 | Can you come tomorrow? | `yol ? zawan thagem bluzurem grawol vavobel oel buwon.` | y-question \| ? \| z-listener \| [th-plan-itinerary \| [b-day \| g-one]] \| v-go \| [toward \| b-speaker] | covered |
| 57 | Have the neighbors gone away for the winter? | `yol ? zaxahehamx om bayan haram vavobelum herem blugebam.` | y-question \| ? \| z-agent-x-home-x \| [near \| b-interlocutors] \| h-RESIDUE \| v-go-recede \| [h-while \| b-winter] | covered |
| 58 | Does the robin sing in the rain? | `yol ? zuam gerulexubezol vezuyol am berulal.` | y-question \| [? \| z-everything.open \| g-red-x-bird] \| v-sing \| [amid \| b-rain] | covered |
| 59 | Are you going with us to the concert? | `yol ? zawan han bluwonx vavobel oel bexezuyol.` | y-question \| ? \| z-listener \| [h-including \| b-speaker-x] \| v-go \| [toward \| b-scene-x-sing] | covered |
| 60 | Have you ever travelled in the jungle? | `yol ? zawan havom vehavam am bubalexedalelx har.` | y-question \| ? \| z-listener \| h-already \| v-voyage \| [amid \| b-palm-x-tree-x] \| h-when | covered |
| 61 | We sailed down the river for several miles. | `zuwonx thevum blezerem grabarem vehaval uol bowulal.` | z-speaker-x \| [th-MEMORY \| [b-meter \| g-+-e3.about]] \| v-ship \| [through \| b-drinking-water] | covered |
| 62 | Everybody knows about hunting. | `zuam vanam hahugem blowozum.` | z-everything.open \| v-knowledge \| [h-topic \| b-predation] | covered |
| 63 | On a Sunny morning after the solstice we started for the mountains. | `ol bururem guzalel halam bluzalexozohul zuwonx thevum damahulx vavobeloel.` | [at \| [b-dawn \| g-sun]] \| [h-after \| b-sun-x-stop] \| z-speaker-x \| th-MEMORY \| d-mountain-x \| v-go-head-for | covered |
| 64 | Tom laughed at the monkey's tricks. | `zemozal vedayum. zuzozen thevum vulamal ol bedayur.` | z-monkey \| v-mischief . z-Uzozen \| th-MEMORY \| v-laugh \| [at \| b-←mischief] | covered |
| 65 | An old man with a walking stick stood beside the fence. | `zalayel gan blugowel thevum vawuvol om bulelegohul.` | [z-old-man \| [g-including \| b-cane]] \| th-MEMORY \| v-stand \| [near \| b-fence] | covered |
| 66 | The squirrel's nest was hidden by drooping boughs. | `danolal em bezezal thevum zedalexobelx gaduhel vohovam.` | d-nest \| [used-by \| b-chipmunk] \| th-MEMORY \| [z-tree-x-bone-x \| g-down] \| v-concealment | covered |
| 67 | The little seeds waited patiently under the snow for the warm spring sun. | `glamezom zelelx haduhel blozulal thevum halazam vobahem duzalel wamezom gohamul gerem blahelem.` | [gl-small \| z-seedling-x] \| [h-down \| b-snow] \| th-MEMORY \| h-composure \| v-wait \| [d-sun \| [w-small \| g-hot] \| [g-while \| b-spring]] | covered |
| 68 | Many little girls with wreaths of flowers on their heads danced around the bonfire. | `zagoyelx gamezom gan bluvelalugobelx thubem zel gral thevum vanurel hevam blavulul.` | [[z-girl-x \| g-small \| [g-including \| b-wreath-x]] \| th-PATTERN \| z-rank/more \| g-amount] \| th-MEMORY \| v-dance \| [h-around \| b-fire] | covered |
| 69 | The cover of the basket fell to the floor. | `zayuhel gobem blabowal thevum vaduhel oel bahehalagulal.` | [z-up \| [g-part-of \| b-basket]] \| th-MEMORY \| v-fall \| [toward \| b-floor] | covered |
| 70 | The first boy in the line stopped at the entrance. | `zuboyel grewol thevum vozohul ol bohol.` | [z-boy \| g-1st] \| th-MEMORY \| v-stop \| [at \| b-door] | covered |
| 71 | On the top of the hill in a little hut lived a wise old woman. | `aol bamahul theyum al behahal gamezom vaheham zolayel gulayem.` | [on \| b-mountain] \| th-NOTIONAL \| [in \| [b-hut \| g-small]] \| v-home \| [z-old-woman \| g-wisdom] | covered |
| 72 | During our residence in the country we often walked in the pastures. | `zuwonx thubem zel hral thevum vowurel am bovehalx herem blarl zuwonx vaheham am begaham.` | [z-speaker-x \| th-PATTERN \| z-rank/more \| h-how-often] \| th-MEMORY \| v-walk \| [amid \| b-field-x] \| [h-while \| b-that-clause] \| z-speaker-x \| v-home \| [amid \| b-rural] | covered |
| 73 | When will your guests from the city arrive? | `yol har glaham blezahem zeyolx gunodum blawan theyem blral vovurel.` | y-question \| h-when \| [[gl-origin \| b-urban] \| z-person-x \| [g-hospitality \| b-listener]] \| [th-CLUES \| b-later] \| v-arrival | covered |
| 74 | Near the mouth of the river, its course turns sharply towards the East. | `om bamebal gobem blowulal zowular hanewum vorugem oel bahel.` | [near \| [b-mouth \| [g-part-of \| b-drinking-water]]] \| z-←drinking-water \| h-severity \| v-turn \| [toward \| b-east] | covered |
| 75 | Between the two lofty mountains lay a fertile valley. | `hedam blamahulx gradul gadahem zaduhel gamelom.` | [h-between \| [b-mountain-x \| g-two \| g-height]] \| [z-down \| g-proliferation] | covered |
| 76 | Among the wheat grew tall red poppies. | `am bugelal thevum velem zuvelalx gadahem gerulel.` | [amid \| b-grain] \| th-MEMORY \| v-growth \| [z-flower-x \| g-height \| g-red] | covered |
| 77 | The strong roots of the oak trees were torn from the ground. | `dedalexuvobelx gobobom gobem bloneduledalelx thevum hanuvum vehugum ual bagulal.` | [d-tree-x-foot-x \| g-strength \| [g-part-of \| b-oak-x]] \| th-MEMORY \| h-force \| v-removal \| [out-of \| b-ground] | covered |
| 78 | The sun looked down through the branches upon the children at play. | `zuzaler thevum haduhel uol bedalexobelx vazebom ol bahoyelx gaxeyaham.` | z-←sun \| th-MEMORY \| h-down \| [through \| b-tree-x-bone-x] \| v-look \| [at \| [b-child-x \| g-agent-x-recreation]] | covered |
| 79 | The west wind blew across my face like a friendly caress. | `zewulel gowuhel thevum vewulel hohem blovemol em buwon hewom blahuyal gazamam.` | [z-wind \| g-west] \| th-MEMORY \| v-wind \| [h-across \| b-face] \| [used-by \| b-speaker] \| [h-like \| [b-hug \| g-goodwill]] | covered |
| 80 | The spool of thread rolled across the floor. | `zoyulal thevum vewovel hohem blahehalagulal.` | z-yarn \| th-MEMORY \| v-wheel \| [h-across \| b-floor] | covered |
| 81 | A box of growing plants stood in the Window. | `zobogal gadam blobololx gaxelem thevum vawuvol al buwohol.` | [z-package \| [g-contents \| [b-house-plant-x \| g-agent-x-growth]]] \| th-MEMORY \| v-stand \| [in \| b-window] | covered |
| 82 | I am very happy. | `welazom thodothamam.` | [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] | covered |
| 83 | These oranges are juicy. | `zadedorx guhudal om buwon.` | [z-←tangerine-x \| g-juice] \| [near \| b-speaker] | covered |
| 84 | Sea water is salty. | `zuam gohalaxowulal gozudal.` | [z-everything.open \| g-ocean-x-drinking-water] \| g-salt | covered |
| 85 | The streets are full of people. | `zeyolx thubem zel gral al borahelx.` | [z-person-x \| th-PATTERN \| z-rank/more \| g-amount] \| [in \| b-road-x] | covered |
| 86 | Sugar tastes sweet. | `zual ganedam godom thubem.` | [z-everything \| g-sugar] \| g-sweetness \| th-PATTERN | covered |
| 87 | The fire feels hot. | `zavulur gohamul thugom.` | [z-←fire \| g-hot] \| th-LIVE | covered |
| 88 | The little girl seemed lonely. | `thawothumam theyemagoyer.` | th-relatedness-unmet-modifiable-INTERNAL-FLOWING \| th-CLUES-←girl | by design (G-01) |
| 89 | The little boy's father had once been a sailor. | `glemugol zeyol gaxehaval grebuwol bluboyel gamezom helam.` | [gl-male \| z-person \| g-agent-x-ship \| [g-#-e-1 \| [b-boy \| g-small]]] \| h-FORMER | covered |
| 90 | I have lost my blanket. | `zuwon haram doyulam em buwon vudurum.` | z-speaker \| h-RESIDUE \| d-blanket \| [used-by \| b-speaker] \| v-loss | covered |
| 91 | A robin has built his nest in the apple tree. | `zerulexubezol haram danolal veguyel al boledoxedalel.` | z-red-x-bird \| h-RESIDUE \| d-nest \| v-construct \| [in \| b-apple-x-tree] | covered |
| 92 | At noon we ate our lunch by the roadside. | `h_12 zuwonx thevum denodal em buwonx vagedal om bexavobel.` | h-_12 \| z-speaker-x \| th-MEMORY \| d-bento \| [used-by \| b-speaker-x] \| v-eat \| [near \| b-scene-x-footprints] | covered |
| 93 | Mr. Jones made a knife for his little boy. | `zahelan thevum danewul vamuyal el buboyel gamezom grebawol blahelar.` | z-Ahelan \| th-MEMORY \| d-knife \| v-manufacture \| [for \| [b-boy \| g-small \| [g-#-e1 \| b-←Ahelan]]] | covered |
| 94 | Their voices sound very happy. | `welazom thodothamam thugomeyorx.` | [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] \| th-LIVE-←person-x | covered |
| 95 | Is today Monday? | `yol ? zolerem grewol thugom.` | y-question \| [? \| z-weekday \| g-1st] \| th-LIVE | covered |
| 96 | Have all the leaves fallen from the tree? | `yol ? zual golelol ul bedalel havom vaduhel.` | y-question \| [? \| z-everything \| g-leaf] \| [from \| b-tree] \| h-already \| v-fall | covered |
| 97 | Will you be ready on time? | `yol ? zawan theyem blral vabam hawerem.` | y-question \| ? \| z-listener \| [th-CLUES \| b-later] \| v-preparation \| h-punctuality | covered |
| 98 | Will you send this message for me? | `yem zawan demunam om buwon veboham hanom bluwon.` | y-request \| z-listener \| d-message \| [near \| b-speaker] \| v-dispatch \| [h-on-behalf-of \| b-speaker] | covered |
| 99 | Are you waiting for me? | `yol ? zawan duwon vobahem.` | y-question \| ? \| z-listener \| d-speaker \| v-wait | covered |
| 100 | Is this the first kitten of the litter? | `yol ? zeboyexagozor g#1e0 om buwon.` | y-question \| [? \| z-baby-x-cat \| g-#-1e0] \| [near \| b-speaker] | covered |
| 101 | Are these shoes too big for you? | `yol ? zuhobarx thudatham blawan zel gelazom.` | y-question \| [? \| z-←shoe-x \| [th-sake-met-any-term \| b-listener] \| z-rank/more \| g-big] | covered |
| 102 | How wide is the River? | `yol zowular wrar gogoram.` | y-question \| z-←drinking-water \| [w-how-many \| g-width] | covered |
| 103 | Listen. | `yel vebam.` | y-command \| v-listening | covered |
| 104 | Sit here by me. | `yel vuhohol om buwon.` | y-command \| v-sit \| [near \| b-speaker] | covered |
| 105 | Keep this secret until tomorrow. | `yel darth vuhamum harum bluzurem grawol.` | y-command \| d-that-same-claim \| v-confidentiality \| [h-until \| [b-day \| g-one]] | covered |
| 106 | Come with us. | `yel han bluwonx vavobel.` | y-command \| [h-including \| b-speaker-x] \| v-go | covered |
| 107 | Bring your friends with you. | `yel han bleyolx gumayam blawan vavobel oel buwon.` | y-command \| [h-including \| [b-person-x \| [g-companionship \| b-listener]]] \| v-go \| [toward \| b-speaker] | covered |
| 108 | Be careful. | `yel gayulem.` | y-command \| g-caution | covered |
| 109 | Have some tea. | `yem dududal gral vodudal.` | y-request \| [d-tea \| g-more-than-one] \| v-drink | covered |
| 110 | Pip and his dog were great friends. | `zuzozen zudozol em buzozer zal welazom gumayam thevum.` | [z-Uzozen \| [z-dog \| [used-by \| b-←Uzozen]] \| z-and \| [w-very \| g-companionship]] \| th-MEMORY | awkward (G-17) |
| 111 | John and Elizabeth are brother and sister. | `zuzozen gemugol zolazun gevugol zal grebazol.` | [[z-Uzozen \| g-male] \| [z-Olazun \| g-female] \| z-and \| g-#-e0] | awkward (G-17) |
| 112 | You and I will go together. | `zayan thagem vavobelx.` | z-interlocutors \| th-plan-itinerary \| v-go-x | covered |
| 113 | They opened all the doors and windows. | `zeyolx thevum dual gohol vohol xal zeyorx dual guwohol vohol.` | [z-person-x \| th-MEMORY \| [d-everything \| g-door] \| v-open \| x-and \| z-←person-x-x \| [d-everything \| g-window] \| v-open] | covered |
| 114 | He is small, but strong. | `zuzozen gamezom. xegohum zuzozer gobobom.` | z-Uzozen \| g-small . x-but \| z-←Uzozen \| g-strength | covered |
| 115 | Is this tree an oak or a maple? | `yol zedaler goneduledalel gemalel ?gar.` | y-question \| z-←tree \| [g-oak \| g-maple \| ?g-wh] | covered |
| 116 | Does the sky look blue or gray? | `yol zugalam gubulel gegulol ?gar thugom.` | y-question \| [z-sky \| [g-blue \| g-gray \| ?g-something]] \| th-LIVE | covered |
| 117 | Come with your father or mother. | `yel han bleyol grebuwol blawan vavobel oel buwon.` | y-command \| [h-including \| [b-person \| [g-#-e-1 \| b-listener]]] \| v-go \| [toward \| b-speaker] | covered |
| 118 | I am tired, but very happy. | `zuwon godamul. xegohum welazom thodothamam.` | z-speaker \| g-tired . x-but \| [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] | covered |
| 119 | He played a tune on his wonderful flute. | `zuzozen thevum dudurel vuwom ael buvorel gemom em buzozer.` | z-Uzozen \| th-MEMORY \| d-tune \| v-performance \| [using \| [b-flute \| g-amazement]] \| [used-by \| b-←Uzozen] | covered |
| 120 | Toward the end of August the days grow much shorter. | `om b_#31,8 zuzuremx thubem zuel welazom gadurem thubem.` | [near \| b-_31,8] \| [z-day-x \| th-PATTERN \| z-rank/less \| [w-very \| g-duration]] \| th-PATTERN | covered |
| 121 | A company of soldiers marched over the hill and across the meadow. | `aom bamahul gamezom zagayulx thevum vowurelx hohem blegudalx.` | [over \| [b-mountain \| g-small]] \| z-guard-x \| th-MEMORY \| v-walk-x \| [h-across \| b-greens-x] | covered |
| 122 | The first part of the story is very interesting. | `zoyuger welazom gagozom gobem blonem.` | [z-←begin \| [w-very \| g-curiosity] \| [g-part-of \| b-tale]] | covered |
| 123 | The crow dropped some pebbles into the pitcher and raised the water to the brim. | `zubuloxubezol thevum darololx gamezom vaduhel al bemodal xan zubuloxubezor dowular vayuhel oel bayuhel gobem blemodar.` | [z-black-x-bird \| th-MEMORY \| [d-rock-x \| g-small] \| v-fall \| [in \| b-amphora] \| x-and-then \| z-←black-x-bird \| d-←drinking-water \| v-up \| [toward \| [b-up \| [g-part-of \| b-←amphora]]]] | covered |
| 124 | The baby clapped her hands and laughed in glee. | `zeboyer thevum vanuyal vulamal val hugemam.` | z-←baby \| th-MEMORY \| [v-clap \| v-laugh \| v-and \| h-delight] | covered |
| 125 | Stop your game and be quiet. | `yel huvum veyaham xal gozemom.` | y-command \| [h-no-longer \| v-play \| x-and \| g-silence] | covered |
| 126 | The sound of the drums grew louder and louder. | `zadowol gaham bludoralx thevum hogowum voyurel.` | [z-audio \| [g-origin \| b-drum-x]] \| th-MEMORY \| h-volume \| v-uptrend | covered |
| 127 | Do you like summer or winter better? | `yol zawan dazedam dugebam ?der volamam.` | y-question \| z-listener \| [d-summer \| d-winter \| ?d-which-rank] \| v-cherished | covered |
| 128 | That boy will have a wonderful trip. | `zuboyer theyem blral vehavam hemom.` | z-←boy \| [th-CLUES \| b-later] \| v-voyage \| h-amazement | covered |
| 129 | They popped corn, and then sat around the fire and ate it. | `zeyolx thevum duredal vugudel xan zeyorx vuhohol hevam blavulul xan zeyorx duredar vagedal.` | [z-person-x \| th-MEMORY \| d-popcorn \| v-cooking \| x-and-then \| z-←person-x-x \| v-sit \| [h-around \| b-fire] \| x-and-then \| z-←person-x-x \| d-←popcorn \| v-eat] | covered |
| 130 | They won the first two games, but lost the last one. | `zeyolx thevum dazahamx g#1 al g#2 veverel. xegohum zeyorx dazaham g#-1 vudurum.` | z-person-x \| th-MEMORY \| [d-contest-x \| g-1st.short] \| through \| g-2nd.short \| v-victory . x-but \| z-←person-x-x \| [d-contest \| g-1st-from-end.short] \| v-loss | covered |
| 131 | Take this note, carry it to your mother; and wait for an answer. | `yel demunam om buwon velobal oel beyol gevugol grebuwol blawan xal vobahem dezuyem.` | y-command \| [d-message \| [near \| b-speaker] \| v-carry \| [toward \| [b-person \| g-female \| [g-#-e-1 \| b-listener]]] \| x-and \| v-wait \| d-discourse] | covered |
| 132 | I awoke early, dressed hastily, and went down to breakfast. | `zuwon thubem zuel bral thevum vayuhel xan zuwon hedurem vudobal xan zuwon vavobel haduhel oel benodal gururem.` | [[z-speaker \| th-PATTERN \| z-rank/less \| b-later] \| th-MEMORY \| v-up \| x-and-then \| z-speaker \| h-haste \| v-dress \| x-and-then \| z-speaker \| v-go \| h-down \| [toward \| [b-bento \| g-dawn]]] | covered |
| 133 | Aha! I have caught you! | `!yalulun. zuwon haram dawan vamewul.` | !y-Alulun . z-speaker \| h-RESIDUE \| d-listener \| v-mousetrap | covered |
| 134 | This string is too short! | `! zovular om buwon thudatham zuel geravam.` | [[! \| z-←thread \| [near \| b-speaker]] \| th-sake-met-any-term \| z-rank/less \| g-length] | covered |
| 135 | Oh, dear! the wind has blown my hat away! | `!yewemun. zewuler haram dazobul em buwon vewulelum.` | !y-Ewemun . z-←wind \| h-RESIDUE \| d-sun-hat \| [used-by \| b-speaker] \| v-wind-recede | covered |
| 136 | Alas! that news is sad indeed! | `!yagamun. zunonar wawothumam goyem.` | !y-Agamun . z-←newspaper \| [w-relatedness-unmet-modifiable-INTERNAL-FLOWING \| g-stimulus] | covered |
| 137 | Whew! that cold wind freezes my nose! | `!yuvumon. zewuler gogomul donebol gobem bluwon vezulol.` | !y-Uvumon . [z-←wind \| g-cold] \| [d-nose \| [g-part-of \| b-speaker]] \| v-ice | covered |
| 138 | Are you warm enough now? | `yol ? zawan thudatham zoel gohamul thabom blagorum grazol.` | y-question \| [? \| z-listener \| th-sake-met-any-term \| z-equal-rank \| g-hot] \| [th-INTUITION \| [b-hour \| g-zero]] | covered |
| 139 | They heard the warning too late. | `zeyolx thudatham zel bral thevum dawugul vebal.` | [z-person-x \| th-sake-met-any-term \| z-rank/more \| b-later] \| th-MEMORY \| d-warning \| v-hear | covered |
| 140 | We are a brave people, and love our country. | `zuwonx golazum xal zuwonx dahal em buwonx volamal.` | [z-speaker-x \| g-courage \| x-and \| z-speaker-x \| d-country \| [used-by \| b-speaker-x] \| v-love] | covered |
| 141 | All the children came except Mary. | `zual gahoyel ul zolazun thevum vovurel.` | [z-everything \| g-child] \| except \| z-Olazun \| th-MEMORY \| v-arrival | covered |
| 142 | Jack seized a handful of pebbles and threw them into the lake. | `zahelan thevum dahebal gadam blarololx gamezom vovebol xan zahelar darolorx vubovel al begavem.` | [z-Ahelan \| th-MEMORY \| [d-hand \| [g-contents \| [b-rock-x \| g-small]]] \| v-fist \| x-and-then \| z-←Ahelan \| d-←rock-x-x \| v-throw \| [in \| b-lake]] | covered |
| 143 | This cottage stood on a low hill, at some distance from the village. | `zegahar theyum vawuvol aol bamahul gamezom um behaham.` | z-←cottage \| th-NOTIONAL \| v-stand \| [on \| [b-mountain \| g-small]] \| [away-from \| b-locality] | covered |
| 144 | On a fine summer evening, the two old people were sitting outside the door of their cottage. | `ol badurul gahelam gerem blazedam zeyolx gradul galayem theyum vuhohol ol bohol gobem blegahal em beyorx.` | [at \| [b-dusk \| g-beauty \| [g-while \| b-summer]]] \| [z-person-x \| g-two \| g-elderhood] \| th-NOTIONAL \| v-sit \| [at \| [b-door \| [g-part-of \| b-cottage]]] \| [used-by \| b-←person-x-x] | covered |
| 145 | Our bird's name is Jacko. | `zubezol em buwonx. zubezor gorol blahelan.` | z-bird \| [used-by \| b-speaker-x] . z-←bird \| [g-SAME \| b-Ahelan] | covered |
| 146 | The river knows the way to the sea. | `zowular dorahel oel bohalal vanam.` | z-←drinking-water \| d-road \| [toward \| b-ocean] \| v-knowledge | covered |
| 147 | The boat sails away, like a bird on the wing. | `zebavar thugom vebavalum hewom blubezol gaxowobel.` | z-←boat \| th-LIVE \| v-boat-recede \| [h-like \| [b-bird \| g-agent-x-wing]] | covered |
| 148 | They looked cautiously about, but saw nothing. | `zeyolx thevum hayulem vazebom ol bual. xegohum zeyorx dal vawebol.` | z-person-x \| th-MEMORY \| h-caution \| v-look \| [at \| b-everything] . x-but \| z-←person-x-x \| d-none \| v-see | covered |
| 149 | The little house had three rooms, a sitting room, a bedroom, and a tiny kitchen. | `zexuhohol zexezuvol zexugudel welazom gamezom zal gobem blahehar gamezom thevum.` | [z-scene-x-chair \| z-scene-x-sleep \| [z-scene-x-cooking \| [w-very \| g-small]] \| z-and \| [g-part-of \| [b-←house \| g-small]]] \| th-MEMORY | covered |
| 150 | We visited my uncle's village, the largest village in the world. | `zuwonx thevum dehaham em beyol gemugol grebazol bleyol grebuwol bluwon vowurelol. zehahar zel gelazom al bogugal.` | z-speaker-x \| th-MEMORY \| d-locality \| [used-by \| [b-person \| g-male \| [g-#-e0 \| [b-person \| [g-#-e-1 \| b-speaker]]]]] \| v-attend . [z-←locality \| z-rank/more \| g-big] \| [in \| b-globe] | covered |
| 151 | We learn something new each day. | `zuwonx veluyel dar gunonam hrawol hruwol bluzurem.` | z-speaker-x \| v-learn \| [d-something \| g-news] \| h-one \| [h-divided-by-one \| b-day] | covered |
| 152 | The market begins five minutes earlier this week. | `zodaham thubem zuel bral bemurem g+5 voyugel herem blagorer om buwon.` | [z-market \| th-PATTERN \| z-rank/less \| b-later] \| [b-minute \| g-five.short] \| v-begin \| [h-while \| [b-←calendar \| [near \| b-speaker]]] | covered |
| 153 | Did you find the distance too great? | `yol ? zeravam thudatham blawan zel gelazom thevum.` | y-question \| [? \| z-length \| [th-sake-met-any-term \| b-listener] \| z-rank/more \| g-big] \| th-MEMORY | covered |
| 154 | Hurry, children. | `yahoyelx. yel vedurem.` | y-child-x . y-command \| v-haste | covered |
| 155 | Madam, I will obey your command. | `yawan. zuwon thagem vehozam dawan.` | y-listener . z-speaker \| th-plan-itinerary \| v-conformity \| d-listener | covered |
| 156 | Here under this tree they gave their guests a splendid feast. | `zeyolx thevum om buwon haduhel bledaler vewal beyolx gunodum bleyorx denodal gemom.` | z-person-x \| th-MEMORY \| [near \| b-speaker] \| [h-down \| b-←tree] \| v-present \| [b-person-x \| [g-hospitality \| b-←person-x-x]] \| [d-bento \| g-amazement] | covered |
| 157 | In winter I get up at night, and dress by yellow candlelight. | `zuwon huam herem blugebam vayuhel herem blanurul xal zuwon vudobal ael buwewel gayulel.` | [z-speaker \| h-always.open \| [h-while \| b-winter] \| v-up \| [h-while \| b-night] \| x-and \| z-speaker \| v-dress \| [using \| [b-candle \| g-yellow]]] | covered |
| 158 | Tell the last part of that story again. | `yel hurugem devahum gobem blonem vezuyel.` | y-command \| h-again \| [d-terminus \| [g-part-of \| b-tale]] \| v-tell | covered |
| 159 | Be quick or you will be too late. | `yel gedurem xol zawan thudatham zel bral vovurel.` | y-command \| [g-haste \| x-or-exactly-one \| [z-listener \| th-sake-met-any-term \| z-rank/more \| b-later] \| v-arrival] | covered |
| 160 | Will you go with us or wait here? | `yol ? zawan thagem han bluwonx vavobel xol zawan thagem vobahem om buwon.` | y-question \| [? \| z-listener \| th-plan-itinerary \| [h-including \| b-speaker-x] \| v-go \| x-or-exactly-one \| z-listener \| th-plan-itinerary \| v-wait \| [near \| b-speaker]] | covered |
| 161 | She was always, shabby, often ragged, and on cold days very uncomfortable. | `zolazun thevum hual golahum. zolazun thubem zel hral welazom golahum thevum. zolazun thevum welazom gahuyam gul herem bluzuremx gogomul.` | z-Olazun \| th-MEMORY \| h-always-except \| g-breakdown . [z-Olazun \| th-PATTERN \| z-rank/more \| h-how-often] \| [w-very \| g-breakdown] \| th-MEMORY . z-Olazun \| th-MEMORY \| [[w-very \| g-comfort] \| g-not] \| [h-while \| [b-day-x \| g-cold]] | covered |
| 162 | Think first and then act. | `yel vevemol xan vuzubam.` | y-command \| [v-think \| x-and-then \| v-effort] | covered |
| 163 | I stood, a little mite of a girl, upon a chair by the window, and watched the falling snowflakes. | `zuwon th(zuwor gagoyel gamezom) thevum vawuvol aol buhohol om buwohol xal zuwon thevum vazebom dazelulx gaxaduhel.` | [z-speaker \| th-ASIDE[z-←speaker \| g-girl \| g-small] \| th-MEMORY \| v-stand \| [on \| b-chair] \| [near \| b-window] \| x-and \| z-speaker \| th-MEMORY \| v-look \| [d-snowflake-x \| g-agent-x-down]] | covered |
| 164 | Show the guests these shells, my son, and tell them their strange history. | `yawan. yel zeyolx gunodum bluwon duhebalx om buwon vawebol thewem blawan. yel beyorx donem golayom em beyorx vezuyel.` | y-listener . y-command \| [z-person-x \| [g-hospitality \| b-speaker]] \| d-shell-x \| [near \| b-speaker] \| v-see \| [th-CAUSE \| b-listener] . y-command \| b-←person-x-x \| [d-tale \| g-strangeness] \| [used-by \| b-←person-x-x] \| v-tell | covered |
| 165 | Be satisfied with nothing but your best. | `yel goremom ol buzubam em bawan bal.` | y-command \| g-calm \| [at \| [[b-effort \| [used-by \| b-listener]] \| b-and]] | covered |
| 166 | We consider them our faithful friends. | `zuwonx vevemol darl zeyorx gudozom gumayam bluwonx.` | z-speaker-x \| v-think \| d-that-clause \| [z-←person-x \| g-loyalty \| [g-companionship \| b-speaker-x]] | covered |
| 167 | We will make this place our home. | `zuwonx thagem dehaham om buwon vamuyal el baheham em buwonx.` | z-speaker-x \| th-plan-itinerary \| d-locality \| [near \| b-speaker] \| v-manufacture \| [for \| b-home] \| [used-by \| b-speaker-x] | covered |
| 168 | The squirrels make their nests warm and snug with soft moss and leaves. | `zezezalx huam danolalx wadowom gohamul gahuyam em bezezar ael bebelal bolelol bal vamuyal.` | z-chipmunk-x \| h-always.open \| [d-nest-x \| [w-quite \| g-hot] \| g-comfort] \| [used-by \| b-←chipmunk-x] \| [using \| [b-herb \| b-leaf \| b-and]] \| v-manufacture | covered |
| 169 | The little girl made the doll's dress herself. | `zagoyel gamezom zal thevum dudobal em beneval vamuyal.` | [[z-girl \| g-small] \| z-and] \| th-MEMORY \| d-dress \| [used-by \| b-nesting-doll] \| v-manufacture | covered |
| 170 | I hurt myself. | `zuwon duwor venamum.` | z-speaker \| d-←speaker \| v-harm | covered |
| 171 | She was talking to herself. | `zolazun thevum blolazur vezuyel.` | z-Olazun \| [th-MEMORY \| b-←Olazun] \| v-tell | covered |
| 172 | He proved himself trustworthy. | `zuzozen thevum duzozer gugowem vurenem.` | z-Uzozen \| th-MEMORY \| [d-←Uzozen \| g-trust] \| v-proof | covered |
| 173 | We could see ourselves in the water. | `zuwonx thevum duworx vawebol al bowulal.` | z-speaker-x \| th-MEMORY \| d-←speaker-x-x \| v-see \| [in \| b-drinking-water] | covered |
| 174 | Do it yourself. | `yel zawan zal vuzubam.` | y-command \| [z-listener \| z-and] \| v-effort | covered |
| 175 | I feel ashamed of myself. | `zuwon thawothumom bluwor.` | z-speaker \| [th-relatedness-unmet-modifiable-AIMED-FLOWING \| b-←speaker] | covered |
| 176 | Sit here by yourself. | `yel zawan zal vuhohol om buwon.` | y-command \| [z-listener \| z-and] \| v-sit \| [near \| b-speaker] | covered |
| 177 | The dress of the little princess was embroidered with roses, the national flower of the Country. | `dudobal em bagoyel gamezom gugobem venewul ael borelalx. zorelarx guvelal gobem blahal.` | d-dress \| [used-by \| [b-girl \| g-small \| g-leadership]] \| v-needle \| [using \| b-rose-x] . [z-←rose-x-x \| g-flower \| [g-part-of \| b-country]] | covered |
| 178 | They wore red caps, the symbol of liberty. | `zeyolx thevum danobalx gerulel vudobal. zanobarx gozugal gahugem blozahom.` | z-person-x \| th-MEMORY \| [d-hat-x \| g-red] \| v-dress . [z-←hat-x-x \| g-symbols \| [g-topic \| b-liberty]] | covered |
| 179 | With him as our protector, we fear no danger. | `han bluzozen gagayul em buwonx zuwonx dogobum dul vevemul.` | [h-including \| [b-Uzozen \| g-guard]] \| [used-by \| b-speaker-x] \| z-speaker-x \| [d-danger \| d-not] \| v-fear | covered |
| 180 | All her finery, lace, ribbons, and feathers, was packed away in a trunk. | `dual gerebem em bolazun velobal al belobal.` | [d-everything \| g-embellishment] \| [used-by \| b-Olazun] \| v-carry \| [in \| b-luggage] | covered |
| 181 | Light he thought her, like a feather. | `zuzozen vevemol darl zolazun thudatham zuel garolom hewom bluvebel.` | z-Uzozen \| v-think \| d-that-clause \| [z-Olazun \| th-sake-met-any-term \| z-rank/less \| g-heavy] \| [h-like \| b-feather] | covered |
| 182 | Every spring and fall our cousins pay us a long visit. | `zeyolx grebawol bleyol grebazol bleyol grebuwol bluwonx huam herem bual gahelem xal herem bual gavelum hadurem duwonx vowurelol.` | [[z-person-x \| [g-#-e1 \| [b-person \| [g-#-e0 \| [b-person \| [g-#-e-1 \| b-speaker-x]]]]]] \| h-always.open \| h-while \| [b-everything \| g-spring] \| x-and \| h-while \| [b-everything \| g-autumn] \| h-duration \| d-speaker-x \| v-attend] | covered |
| 183 | In our climate the grass remains green all winter. | `zual gegudal golel hawum herem blugebam am bogulum em buwonx.` | [z-everything \| g-greens] \| g-green \| h-still \| [h-while \| b-winter] \| [amid \| b-weather] \| [used-by \| b-speaker-x] | covered |
| 184 | The boy who brought the book has gone. | `zuboyel thevum danal velobal. zuboyer haram vavobelum.` | z-boy \| th-MEMORY \| d-book \| v-carry . z-←boy \| h-RESIDUE \| v-go-recede | covered |
| 185 | These are the flowers that you ordered. | `zawan thevum duvelalx vogowam. zuvelarx om buwon thugom.` | z-listener \| th-MEMORY \| d-flower-x \| v-consumption . z-←flower-x-x \| [near \| b-speaker] \| th-LIVE | covered |
| 186 | I have lost the book that you gave me. | `zawan thevum danal buwon vewal. zuwon haram danar vudurum.` | z-listener \| th-MEMORY \| d-book \| b-speaker \| v-present . z-speaker \| h-RESIDUE \| d-←book \| v-loss | covered |
| 187 | The fisherman who owned the boat now demanded payment. | `zaxevezal thevum debaval vogunum. zaxogunur thugom vern derl daral vewal.` | z-agent-x-fish \| th-MEMORY \| d-boat \| v-ownership . z-←agent-x-ownership \| th-LIVE \| v-command \| d-to-clause \| d-money \| v-present | covered |
| 188 | Come when you are called. | `yel vavobel oel buwon herem blarl dawan vohorem.` | y-command \| v-go \| [toward \| b-speaker] \| [h-while \| b-that-clause] \| d-listener \| v-summons | covered |
| 189 | I shall stay at home if it rains. | `zuwon thagem vaheham thohom blarl verulal.` | z-speaker \| th-plan-itinerary \| v-home \| [th-if \| b-that-clause] \| v-rain | covered |
| 190 | When he saw me, he stopped. | `zuzozen thevum vozohul herem blarl zuzozen thevum duwon vawebol.` | z-Uzozen \| th-MEMORY \| v-stop \| [h-while \| b-that-clause] \| z-Uzozen \| th-MEMORY \| d-speaker \| v-see | covered |
| 191 | Do not laugh at me because I seem so absent minded. | `yul vulamal ol buwon thahum blarl zuwon theyemawan gazebom gul.` | y-prohibition \| v-laugh \| [at \| b-speaker] \| [th-because \| b-that-clause] \| z-speaker \| th-CLUES-listener \| [g-attention \| g-not] | covered |
| 192 | I shall lend you the books that you need. | `zawan thugom danalx vebom. zuwon thagem danarx dawan vegeral.` | z-listener \| th-LIVE \| d-book-x \| v-necessity . z-speaker \| th-plan-itinerary \| d-←book-x \| d-listener \| v-lend | covered |
| 193 | Come early next Monday if you can. | `yel zawan thubem zuel bral vavobel oel buwon herem blolerem grewol thohom blarl zawan vavobexal.` | y-command \| [z-listener \| th-PATTERN \| z-rank/less \| b-later] \| v-go \| [toward \| b-speaker] \| [h-while \| [b-weekday \| g-1st]] \| [th-if \| b-that-clause] \| z-listener \| v-go-able | covered |
| 194 | If you come early, wait in the hall. | `yel vobahem al bexowurel thohom blarl zawan thubem zuel bral vavobel.` | y-command \| v-wait \| [in \| b-scene-x-walk] \| [th-if \| b-that-clause] \| [z-listener \| th-PATTERN \| z-rank/less \| b-later] \| v-go | covered |
| 195 | I had a younger brother whose name was Antonio. | `zahelan thevum glemugol grebazol bluwon. zahelan zuwon zuel guburem.` | z-Ahelan \| th-MEMORY \| gl-male \| [g-#-e0 \| b-speaker] . [z-Ahelan \| z-speaker \| z-rank/less \| g-age] | covered |
| 196 | Gnomes are little men who live under the ground. | `glemugol zeyolx gamezom huam vaheham haduhel blagulal.` | [gl-male \| z-person-x \| g-small] \| h-always.open \| v-home \| [h-down \| b-ground] | covered |
| 197 | He is loved by everybody, because he has a gentle disposition. | `zual geyol duzozen volamal thahum blarl zuzozen gegemam.` | [z-everything \| g-person] \| d-Uzozen \| v-love \| [th-because \| b-that-clause] \| [z-Uzozen \| g-kindness] | covered |
| 198 | Hold the horse while I run and get my cap. | `yel dohazel vovebol. herem blarl zuwon varuvel danobal em buwon velobal val.` | y-command \| d-horse \| v-fist . [h-while \| b-that-clause] \| z-speaker \| v-run \| d-cap \| [used-by \| b-speaker] \| [v-carry \| v-and] | covered |
| 199 | I have found the ring I lost. | `zuwon thevum dorebol vudurum. zuwon haram dorebor vumewol.` | z-speaker \| th-MEMORY \| d-ring \| v-loss . z-speaker \| h-RESIDUE \| d-←ring \| v-find | covered |
| 200 | Play and I will sing. | `yel veyaham. xan zuwon thagem vezuyol.` | y-command \| v-play . x-and-then \| z-speaker \| th-plan-itinerary \| v-sing | covered |
| 201 | That is the funniest story I ever heard. | `zuwon havom thevum donemx vebam. zoner zel gulamam.` | z-speaker \| h-already \| th-MEMORY \| d-tale-x \| v-listening . [z-←scroll \| z-rank/more \| g-amusement] | covered |
| 202 | She is taller than her brother. | `zolazun glemugol zeyol grebazol blolazun zel gadahem.` | z-Olazun \| gl-male \| z-person \| g-#-e0 \| b-Olazun \| z-rank/more \| g-height | covered |
| 203 | They are no wiser than we. | `zuzozenx zuwonx zuel gulayem.` | [z-Uzozen-x \| z-speaker-x \| z-rank/less \| g-wisdom] | covered |
| 204 | Light travels faster than sound. | `zabulol zogowum zel hedurem vavobel.` | [z-bright \| z-volume \| z-rank/more \| h-haste] \| v-go | covered |
| 205 | We have more time than they. | `zuwonx zuzozenx zel gral dadurel vogunum.` | [z-speaker-x \| z-Uzozen-x \| z-rank/more \| g-amount] \| d-time \| v-ownership | covered |
| 206 | She has more friends than enemies. | `zahuyayolx em bolazun zeyolx gavuvum em bolazun zel gral.` | z-friend-x \| [used-by \| b-Olazun] \| [[z-person-x \| g-struggle \| [used-by \| b-Olazun]] \| z-rank/more \| g-amount] | covered |
| 207 | He was very poor, and with his wife and five children lived in a little low cabin of logs and stones. | `zuzozen thubem zuel wohalal gral thevum daral vogunum. zuzozen thevum vaheham han bleyol gevugol gohuyam bluzozen han blahoyelx g+5 al behahal gamezom hulem blulel blarolol bal.` | [z-Uzozen \| th-PATTERN \| z-rank/less \| [w-ocean \| g-amount]] \| th-MEMORY \| d-money \| v-ownership . z-Uzozen \| th-MEMORY \| v-home \| [h-including \| [b-person \| g-female \| [g-partnership \| b-Uzozen]]] \| [h-including \| [b-child-x \| g-five.short]] \| [in \| [b-hut \| g-small]] \| [h-material \| [b-wood \| b-rock \| b-and]] | covered |
| 208 | When the wind blew, the traveler wrapped his mantle more closely around him. | `zaxowurel thubem zel hahuyam thevum dogobal em baxowurer vabedum hevam blaxowurer. herem blarl zewulel thevum vewulel.` | [z-agent-x-walk \| th-PATTERN \| z-rank/more \| h-comfort] \| th-MEMORY \| [d-coat \| [used-by \| b-←agent-x-agent-x-walk]] \| v-encapsulation \| [h-around \| b-←agent-x-agent-x-walk] . [h-while \| b-that-clause] \| z-wind \| th-MEMORY \| v-wind | covered |
| 209 | I am sure that we can go. | `zuwonx theyel vavobexal.` | z-speaker-x \| th-CLUES.strong \| v-go-able | covered |
| 210 | We went back to the place where we saw the roses. | `zuwonx thevum dorelalx vawebol ol behaham. zuwonx thevum vavobel hebuhel oel behahar.` | z-speaker-x \| th-MEMORY \| d-rose-x \| v-see \| [at \| b-locality] . z-speaker-x \| th-MEMORY \| v-go \| h-back \| [toward \| b-←hut] | covered |
| 211 | "This tree is fifty feet high," said the gardener. | `zaxobolol thevum d[zedalel gadahem bezerem g+15 om buwon] vezuyel.` | z-agent-x-house-plant \| th-MEMORY \| d-CITE[[z-tree \| [g-height \| [b-meter \| g-15]]] \| [near \| b-speaker]] \| v-tell | covered |
| 212 | I think that this train leaves five minutes earlier today. | `zuwon vevemol darl zedavel om buwon thubem zuel bral bemurem g+5 herem bluzurem om buwon vavobelum.` | z-speaker \| v-think \| d-that-clause \| [[z-train \| [near \| b-speaker]] \| th-PATTERN \| z-rank/less \| b-later] \| [b-minute \| g-five.short] \| [h-while \| [b-day \| [near \| b-speaker]]] \| v-go-recede | covered |
| 213 | My opinion is that the governor will grant him a pardon. | `zuwon vevemol darl zaxugobel theyem blral duzozen vabugom.` | z-speaker \| v-think \| d-that-clause \| z-agent-x-crown \| [th-CLUES \| b-later] \| d-Uzozen \| v-forgiveness | covered |
| 214 | Why he has left the city is a mystery. | `vemayom dorl zuzozen haram vavobelum ul bezahel thahum bar.` | v-mystery \| d-whether-clause \| z-Uzozen \| h-RESIDUE \| v-go-recede \| [from \| b-skyline] \| th-because \| b-something | covered |
| 215 | The house stands where three roads meet. | `zorahelx g+3 vuyahem. zahehal thugom vawuvol al buyaher.` | [z-road-x \| g-three.short] \| v-hub . z-house \| th-LIVE \| v-stand \| [in \| b-←station] | covered |
| 216 | He has far more money than brains. | `zaral em buzozen zebobom em buzozen zel wohalal gral.` | z-money \| [used-by \| b-Uzozen] \| [[z-intellect \| [used-by \| b-Uzozen]] \| z-rank/more \| [w-ocean \| g-more-than-one]] | covered |
| 217 | Evidently that gate is never opened, for the long grass and the great hemlocks grow close against it. | `zohol theyel vohol hal thahum blarl zegudal geravam zedalelx gelazom zal velem om bohor.` | z-door \| th-CLUES.strong \| v-open \| h-never \| [th-because \| b-that-clause] \| [[z-greens \| g-length] \| [z-tree-x \| g-big] \| z-and] \| v-growth \| [near \| b-←open] | covered |
| 218 | I met a little cottage girl; she was eight years old, she said. | `zuwon thevum dagoyel gamezom gegaham vuyahem. zagoyer thevum d~[zagoyer bavuvam g+8 guburem] vezuyel.` | z-speaker \| th-MEMORY \| [d-girl \| g-small \| g-rural] \| v-hub . z-←girl \| th-MEMORY \| d-CITE.about[z-←girl \| [b-year \| g-eight.short \| g-age]] \| v-tell | covered |

### Notes

- **STC-1–10, *the sun*:** a full-root resume `zuzaler` with no antecedent is *the one we both know*, which fits a unique referent. No article gap.
- **STC-1:** read as a plain report. A general truth (*the sun shines, as a rule*) would add *always* `hual`.
- **STC-2–7, tense:** by design (no tense letter). The progressive is LIVE, the past is MEMORY, and the future is a channel + `blral`. *Tomorrow* is the day offset +1 on that channel. Each forecast has to choose a warrant; PATTERN is the honest one for sunrise.
- **STC-5, *has been shining*:** *still* `hawum` carries "began earlier, goes on now". The English duration-up-to-now is only implied; a measured duration would need a measure phrase.
- **STC-10, *now*:** LIVE already means "in view now" and takes no zero offset, so there is no separate *now* word.
- **STC-8:** with `v:shine` on *bright*, `habulol vabulol` reads *shines brightly*, like the English.
- **STC-11–13, *the people*:** `zual geyol` with no place hook is every person the situation is about. *Some of* / *many of* resume the known group (`zeyorx`) and give the amount, per the denominator recipe; *many* names the Typical bar.
- **STC-15–20, *kitten*:** a live compound, *baby* `x` *cat* (`ebebexagada`); later mentions resume it in full.
- **STC-17, 26, 31, 33, *away*:** hook compound with `um` (*recede*) on the motion verb: `vowurelum`, `vavobelum`, `vewovelum`, `vumemulum`.
- **STC-19, 21:** *came down* is *fall*; *has stopped* is *no longer* `huvum` (the rain no longer falls), so no *stop* verb is needed.
- **STC-24, *once*:** FORMER `helam` (a past climate, not today's). *Here* is `om buwon`.
- **STC-28, *should*:** prescription with the unnamed sake, `thudathem`. **STC-37, *must*:** `thonam`.
- **STC-29, *happy to*:** emotion compose on `/th/`: pleasure met, INTERNAL, FLOWING (`thodothamam`) — the speaker's own feeling, so no holder is needed.
- **STC-33, *probably*:** stance number `thral` (*likely*, no figure).
- **STC-38, *opposite*:** `honuhethayan` — in front, as the two of us face. *Directly* is dropped.
- **STC-45, *village*:** *hut* in its abstract sense, `behaham` (*locality*). *For a visit* is `hovam` + the *attend* compound as a noun.
- **STC-47, *wait for you*:** the awaited person is the object.
- **STC-50, *her father*:** kin number `grebuwol` (the layer above) + `/b/` the child, with *male* before it. Long, but every piece is taught.
- **STC-51, *oldest girl in the village*:** superlative `zagoyel zel guburem`; the group in play is set by the clause-level *in the village* hook. *Yesterday* is the day offset −1 on MEMORY.
- **STC-52–56, 59, 73, 97, 99, questions:** no channel under `yol` where *did* / *are … coming* read from the bare verb. A question about intent takes PLAN (STC-56 *can you come tomorrow*). A forecast in a question puts a channel under `yol`, which asks for the listener's warrant (STC-73, 97: CLUES + `blral`). *Ready* in STC-97 is the verb *prepare* (`vabam`), since `gabam` is *before*.
- **STC-52, *this village*:** `al behaham om buwon`: a hook + `/b/` right after a landmark describes it (*the village near me*).
- **STC-53, 55, *your brother / sister*:** sibling kin `grebazol` + `/b/` listener, with *male* / *female* before. **STC-89, 93, *father*, *his boy*:** `grebuwol` / `grebawol` on the kin anchor.
- **STC-57, *neighbors*:** agent compound on *home* (`zaxahehamx`) + *near us*. *Gone away* keeps RESIDUE (they are still away). *Winter* is the *gloves* abstract (`bugebam`).
- **STC-58, 91, *robin*:** compound *red* `x` *bird* (`eredaxebedu`); the habit question is an open universal `zuam`.
- **STC-59, *concert*:** scene compound on *sing* (`bexezuyol`, a sing-event). *With us* (not the listener) is `han bluwonx`. **STC-63, 72, 92:** narrative *we* that leaves the listener out is `zuwonx`, not `zayan`.
- **STC-60, *ever*:** `havom … har`. *Travel* is `vehavam` (*voyage*). *Jungle* is the compound *palm* `x` *tree* (`bubalexedalelx`).
- **STC-61, *several miles*:** metric, not miles: `bezerem grabarem` (*thousands of meters*, about). *Down* the river is dropped.
- **STC-62, *knows*:** the *book* abstract as a verb (`vanam`); *about* is `hahugem`. *Everybody* is open `zuam` (as far as I know). *Hunting* stays *predation* (`bowozum`); the verb *hunt* is `varunel`, role English on *archery*.
- **STC-63, *solstice*:** compound *sun* `x` *stop* (`buzalexozohul`). *Started for* is the hook compound *go* + *toward* (`vavobeloel`).
- **STC-63, 71, 74, 76:** fronted place phrases (`aol bamahul …`, `am bugelal …`) now parse as extra-noun hooks (parser fix; see results).
- **STC-64, *the monkey's tricks*:** two sentences, then an event resume (`bedayur`), the recipe for an act as someone's (say-people-places.md § someone's act).
- **STC-66, *was hidden by*:** object first, then the hider as subject. *Boughs* is *tree* `x` *bone* (`zedalexobelx`).
- **STC-67, *spring sun*:** the time pole on the noun, `gerem blahelem` (*during spring*).
- **STC-68, *wreaths … on their heads*:** *wreath* is the compound `buvelalugobelx`. *On their heads* is dropped: a hook + `/b/` after the wreath (`aol behobolx`) would split the *many* rank from its noun. *Head* is `behobol`.
- **STC-70, *in the line*:** dropped; the ordinal already says the order.
- **STC-71, *lived*:** NOTIONAL `theyum`, since this is story narration; later sentences of the tale carry it forward.
- **STC-73, *your guests*:** people cannot take `em`, so *guests* is the *hospitality* tie (`gunodum blawan`); *from the city* goes before the noun with `gl-`, since two relation adjectives cannot follow one noun.
- **STC-74, *sharply*:** `hanewum` (*severity*, the knife abstract). *Course turns* is `vorugem` (*turn*, the abstract on *refresh*).
- **STC-75, 76, 78, 79:** an `/h/`-hosted `/b/` now keeps its adjectives (`hedam blamahulx gradul gadahem`, `hewom blemuyal gazamam`; parser fix).
- **STC-82, 94, *happy*:** emotion compose, pleasure met, INTERNAL, FLOWING (`thodothamam`). Someone else's feeling takes a holder (STC-88 `theyemagoyer`, STC-94 `thugomeyorx`); a holder can be a full-root resume, and a group takes **-x** (*those people*).
- **STC-83, *these oranges*:** full-root resume (the ones we both see) plus *near me*; a new noun would read as *there are juicy oranges here*.
- **STC-84, *sea water is salty*:** `zuam` + kind + `/ɡ/` is a property of every member, as a rule (exceptions not listed).
- **STC-85, *full of people*:** approximated as *many people in the streets* (Typical bar). *Streets* is *road* (`borahelx`).
- **STC-86, 87, *tastes / feels*:** the sense is the channel: LIVE for a present touch, PATTERN for a general taste. *Sugar* is the *candy* abstract (`ganedam`).
- **STC-89, *had once been*:** FORMER `helam`. The predicate *sailor* sits between the noun and the kin relation, so it describes the father, not the boy.
- **STC-95, *Monday*:** *first weekday* (`zolerem grewol`, counting from Monday) under LIVE for *today*.
- **STC-65, 69, 72, 76, 77, 79, 80, 144, new words:** *fence* `bulelegohul`, *floor* `bahehalagulal`, *field* `bovehalx`, *wheat* `bugelal` (*grain*), *oak* `boneduledalelx`, *ground* `bagulal`, *face* `bovemol`, *summer* `bazedam`.
- **STC-72, 79, 96, new rows:** *country* is `begaham` (*rural*), *caress* is *hug* (`bahuyal`), *leaves* is `golelol`.
- **STC-98, a polite request:** English *Will you … for me?* is a request, so it takes soft request `yem`; *for me* is proxy `hanom`.
- **STC-100, *first of the litter*:** eldest sibling `g#1e0`.
- **STC-101, 115, *these shoes* / *this tree*:** full-root resume only. `om buwon` before a rank join or a fill-ask list would make the next `/ɡ/` words describe the speaker (the landmark). *Too big for you* is the unspecified sake bar with the listener in its `/b/` as whose stake (`thudatham blawan`).
- **STC-102, *how wide*:** `wrar` on *width* (`gogoram`, the *accordion* abstract).
- **STC-103–108, commands:** *listen* is the *ear* abstract as a verb (`vebam`), not *hear* (`vebal`). *Keep this secret* is *keep confidential* (`vuhamum`, the *hush* abstract) with `darth` for *this*; *until tomorrow* is a signed day count in the pole's `/b/` (`harum bluzurem grawol`), counted from now. *Be careful* is `yel gayulem`, a command with only a `/ɡ/` body. *Come* / *bring … with you* is `vavobel` + `han` (company); with a place, `oel buwon`.
- **STC-90, *blanket*:** the *yarn* abstract (`doyulam`). **STC-134, *too short*:** less *length* (`geravam`, the *railcar* abstract). **STC-142, *threw … lake*:** `vubovel` (role English on *boomerang*) and `begavem` (the *canoe* abstract).
- **STC-109, *have some tea*:** an offer, so soft request `yem`; `gral` on a mass noun is *some*. The verb is `vodudal` (*drink*).
- **STC-110, 111, *friends* / *brother and sister*:** the tie or kin word is SHARED after the join with no `/b/`, so *of each other* is only implied (G-17). *His dog* is a hook + `/b/` right before the join word (`zudozol em buzozer zal`, G-18).
- **STC-112, *go together*:** PLAN plus collective **-x** on the verb.
- **STC-113, *all the doors and windows*:** two *every K* clauses, since a kind join after `dual` does not read as one kind. *Open* is `vohol` (role English on *door*).
- **STC-114, 118, 130, 148, *but*:** the linker `xegohum` starts a second sentence. *Small but strong*, *tired but happy*: the first claim sets an expectation the second blocks.
- **STC-116, *the sky … look*:** *sky* (`zugalam`, the *cloud* abstract) and *gray* (`gegulol`); *look* is LIVE, as *feels* was in STC-87. The choice is a fill-ask over the two colors (`?gar`).
- **STC-117, 131, 150, kin:** *father or mother* is the parent layer with no mantissa (`grebuwol`, one member). *Uncle* is a male sibling of a parent. *Mother* is `gevugol` before the kin number.
- **STC-119, *played a tune on*:** *perform* (`vuwom`) with the flute as a tool (`ael`); `em buzozer` follows the flute's adjective, as in hooks.md § Whose.
- **STC-120, *toward the end of August*:** *near 31 August* (`om b_#31,8`). *The days grow much shorter* is *much less duration than usual* on PATTERN.
- **STC-121, *company of soldiers marched*:** *guards* (💂) walking as one act (`vowurelx`). The fronted *over the hill* keeps the two extras apart.
- **STC-122, *the first part of the story*:** *the beginning* (`zoyuger`, a full-root resume), with *interesting* (*curiosity*) before the relation so it describes the beginning, not the story.
- **STC-123, *crow*, *pitcher*, *brim*:** *black* `x` *bird*, *amphora*, *the top part of it*. *Dropped* is *fall* with an object.
- **STC-124, *in glee*:** SHARED `/h/` after a verb join covers both verbs. The manner is observable, so no holder is needed.
- **STC-125, *stop … and be quiet*:** *no longer play* (`huvum veyaham`), then *be quiet* as a `/ɡ/`-only command clause (`gozemom`) in a clause join under the same command.
- **STC-126, *louder and louder*:** *rose in volume* (`hogowum voyurel`, the uptrend verb).
- **STC-127, *better*:** `?der` asks which ranks first. *Summer* is the *ice-cream* abstract (`dazedam`).
- **STC-128, 139:** *will* is CLUES + `blral`; *too late* is a sake bar, `thudatham zel bral`.
- **STC-129, 132, 142:** a string of acts by one subject is `xan` with a resumed subject, since verb-join items cannot carry their own objects (G-19).
- **STC-133–137, interjections:** `/y/` + **-n** on the matching root: *aha* is *insight* (`yalulun`), *oh dear* is *worried* (`yewemun`), *alas* is *cry* (`yagamun`), *whew* is *phew* (`yuvumon`). *Indeed* and the English *!* are the `!` tone mark.
- **STC-136, *that news is sad*:** the speaker's feeling on a noun they do not own, so emotion compose on `/w/` + `goyem`.
- **STC-138, *warm enough now*:** the unspecified sake bar's tie on *hot*, and INTUITION with a zero offset asks what the listener's body says now.
- **STC-140, *a brave people*:** reduced to *we are brave*.
- **STC-143, 144:** story narration, so NOTIONAL. *Outside the door* is *at the door*.
- **STC-145, *our bird's name is Jacko*:** two sentences, since `gorol` after `em buwonx` would describe the speaker group.
- **STC-146, *the way to the sea*:** *road* with *toward the sea*.
- **STC-147, *on the wing*:** *flier* (agent compound on *wing*).
- **STC-149, *rooms*:** scene compounds on *chair*, *sleep*, and *cooking*. *Had three rooms* is an existence list SHARED as *part of the little house*; the count is the list.
- **STC-151, 182, *each day* / *every spring and fall*:** a counted unit is a count per unit (`hrawol hruwol bluzurem`, once per day); named seasons are a universal kind in the time pole (`herem bual gahelem`). *Something new* is `dar` (an unnamed new thing) plus *news* (`gunonam`).
- **STC-152, *market*, *minutes*, *this week*:** *market* is the new abstract on 🏬 (`zodaham`, L-09). *Minute* is the new stock unit `bemurem` (L-10). *This week* is the full-root resume `bagorer` plus `om buwon`, which describes the week ([hook + `/b/` on a landmark](../grammar/hooks.md)). *Earlier* is the `bral` scale against the *Usual* bar.
- **STC-153, *find … too great*:** *distance* is *length* (`zeravam`). MEMORY under `yol` asks for the listener's own warrant, as in STC-97.
- **STC-154, 155, 164, address:** *children* is a kind vocative with **-x** (`yahoyelx`). *Madam* and *my son* are the listener (`yawan`); the title and the kin word are dropped.
- **STC-155, *obey*:** `vehozam` (the *conformity* abstract). *Command* is dropped; `vern` states a command as content, but here the act is the obeying.
- **STC-156, *here under this tree*:** `haduhel` + landmark is *under* (roles.md § gravity). *Feast* is a wonderful *bento* (`denodal gemom`), *gave* is `vewal` (*present*), and *their guests* is the *hospitality* tie with a resume (`beyolx gunodum bleyorx`).
- **STC-157, *in winter … at night*:** two `herem` poles, with COMMON for the routine. *Candlelight* is *using a yellow candle* (`gayulel`); *get up* is `vayuhel` (*up*), *dress* is `vudobal`.
- **STC-158, *last part*:** *the end* (`devahum`, the *finish-line* abstract) of the tale, as in STC-122.
- **STC-159, 160, *or*:** `xol` between clauses. In 159 the second clause is the rank claim *later than needed* with the verb *arrive*, so the threat is the outcome, not a forecast.
- **STC-161, *shabby*, *ragged*, *uncomfortable*:** three claims. *Shabby* and *ragged* are *breakdown* (`golahum`, as *broken* in STC-41), with `welazom` on the second; *uncomfortable* is *not comfortable* (`gahuyam gul`) placed before the *cold days* pole so the `/w/` word stays on the adjective.
- **STC-162, *think first and then act*:** verb join `xan` (*and then*). *Act* is *effort* (`vuzubam`).
- **STC-163, *a little mite of a girl*:** an aside with a resume of the speaker (`th(zuwor gagoyel gamezom)`). *Falling* is the agent compound on *down* (`gaxaduhel`).
- **STC-164, *show … tell*:** *show* is CAUSE with the listener as causer (`thewem blawan`): the guests are the subject of *see*. *History* is *tale*, and *strange* is the *alien* abstract (`golayom`).
- **STC-165, *nothing but*:** the single-item **-l** join is *just* ([joins](../grammar/joins.md)): `ol buzubam em bawan bal` is *at only your effort*. *Best* is *effort*.
- **STC-166, *consider … faithful friends*:** `darl` and a second sentence. *Faithful* is the *loyalty* abstract on *dog* (`gudozom`).
- **STC-167, *make this place our home*:** *make* (`vamuyal`) with `el` (*for*) and *home* (`baheham`, the *house* abstract), owned by us with `em`. *This place* is *locality* plus `om buwon`.
- **STC-168, *warm and snug … soft moss*:** *warm* is *quite hot* (`wadowom gohamul`), *snug* is *comfort*, *moss* is *herb* (`bebelal`); *soft* is dropped. The noun join `bal` closes *herb and leaf*, both under `ael`.
- **STC-169, 174, 176, *-self* as *unaided*:** the single-item **-l** join is *just* ([joins](../grammar/joins.md)): `zagoyel gamezom zal` is *only the little girl*, so nobody else did it. It also gives *alone* (STC-176).
- **STC-170, 171, 173, 175, reflexives:** a resume in the object or recipient slot points back at the subject ([pronouns](../grammar/pronouns.md#resume-r)). *Ashamed of myself* is unmet relatedness aimed at oneself (`thawothumom bluwor`). **STC-172:** *proved* is the *proof* abstract as a verb (`vurenem`).
- **STC-177, *embroidered*, *princess*:** no subject, with *sew* from *needle* (`venewul`). *Princess* is *small girl* with *leadership* (`gugobem`). *National flower of the Country* is a second sentence: `gobem blahal` (*country*, 🗾).
- **STC-178, *symbol of liberty*:** *symbols* (`gozugal`) with *about* (`gahugem`) and the *liberty* abstract on *statue*.
- **STC-179, *with him as our protector*:** `han bluzozen gagayul em buwonx` (including Uzozen the guard). *No danger* is `dogobum dul`.
- **STC-180, *finery … packed*:** *finery* is *embellishment*; lace, ribbons, and feathers are dropped. *Trunk* is *luggage* (`belobal`), *packed away* is *carry* (`velobal`), and the subject is left out.
- **STC-181, *light … like a feather*:** `darl` and a second sentence. *Light* is *less heavy than the unspecified sake bar* (`thudatham zuel garolom`).
- **STC-182, *cousins*, *long visit*:** cousin is a child of a sibling of a parent: three kin anchors (`grebawol bleyol grebazol bleyol grebuwol bluwonx`). *Long* is `hadurem`; *pay a visit* is *attend* with the visited as object.
- **STC-183, *climate*, *remains*:** `zual` + kind + `/ɡ/` is a property of every member (STC-84); *remains* is `hawum`; *climate* is *weather* (`bogulum`).
- **STC-184–187, relative clauses:** two sentences with a resume. *Brought* is *carry*; *ordered* is *consumption* (`vogowam`, from *cart*), so *bought*. **STC-187:** the fisherman's own event comes first (`vogunum`, *own*), then the doer resume `zaxogunur` ([roles](../grammar/roles.md#this-instance-r)), and *demanded payment* is `vern` with *money given*.
- **STC-188–190:** `herem blarl` is *when*, `thohom blarl` is *if*. *Stop* is `vozohul`; *called* is *summoned* (`vohorem`).
- **STC-191, *seem*:** the holder seam names the listener (`theyemawan`, *as you see it*), so the speaker never states the impression as plain fact. *Absent-minded* is *not attentive* (`gazebom gul`).
- **STC-192, *lend*, *need*:** *lend* is role English on *credit-card* (`vegeral`); *need* is the *necessity* abstract as a verb (`vebom`). Two sentences with a book resume.
- **STC-193, 194, *early*, *Monday*:** *early* is the PATTERN bar, `thubem zuel bral` (G-03); the bar needs a ranked item, so the listener is named; *next Monday* is the weekday ordinal under `herem` (G-14). *Hall* is the scene compound on *walk* (`bexowurel`).
- **STC-195, *name was Antonio*:** the name is a house-cast name (`zahelan`), not a foreign payload. *Younger* is the rank on *age*, said as its own sentence.
- **STC-196, *gnomes*:** no gnome root; *little men* under `haduhel blagulal` (*down* on the ground), with COMMON for the habitual claim. *Under* has no hosted relation of its own.
- **STC-197, *loved by everybody*:** object first, then the lover as subject; *gentle* is *kindness* (`gegemam`) under the because pole.
- **STC-198, 199, *hold*, *find*:** *hold* is *seize* (`vovebol`); *find* is role English on *magnify* (`vumewol`, L-12). *Run and get my cap* is a verb list closed by `val` (G-19).
- **STC-201, *funniest*:** *hear* is the *listening* abstract; *story* is the *tale* abstract, and `zoner` is *that one* with the superlative bar.
- **STC-202, 206, 216, comparatives:** the second name is a full noun phrase (`glemugol zeyol grebazol blolazun`). *Enemies* is *people of struggle* (`gavuvum`). *Far more* is `wohalal` on the amount scale, as in comparatives.md.
- **STC-203, *no wiser than*:** the whole comparison denied with a **u** join (`zel gamahum zul`: below or tied), not reverse rank `zuel`, which is *not as … as* (comparatives.md § Intermediate; G-23). The English implication that neither is wise is not said.
- **STC-204, *faster*:** the manner scale, `hedurem` (*haste*). *Light* is `zabulol` (*bright*); *sound* is *volume* (`zogowum`).
- **STC-207, *very poor*:** *far fewer than typical* on the amount of money owned. *Wife* is a female partner tie (`gohuyam`), and the two `han` hooks keep *his wife* and *five children* apart. *Cabin* is *little hut*; *low* is dropped; *of logs and stones* is `hulem` with a join.
- **STC-208, *mantle*, *closely*:** *mantle* is *coat*; *traveler* is the agent compound on *walk*. *More closely* is approximated as *more snugly* (`hahuyam`), as in STC-168.
- **STC-209, *sure*:** a strong CLUES channel (`theyel`), the *-l* ending being solid evidence.
- **STC-210, 215, *the place where*:** name the place, then resume it in the next sentence (dependents.md § which noun). *Meet* is the *hub* abstract as a verb (`vuyahem`), and the road event is resumed as `buyaher`.
- **STC-211, *fifty feet*:** metric, `bezerem g+15` after the scale adjective, as in say-amounts.md. *Gardener* is the agent compound on *tending*. The quote is an exact cite.
- **STC-212, 213, *I think*:** `vevemol darl`. *My opinion is that* is said as *I think that*; *governor* is the agent compound on *leadership*, *pardon* is *forgive* (`vabugom`).
- **STC-214, *why he has left*:** a reported *why* is the `thahum bar` blank inside `dorl` ([reported questions](../grammar/say-questions.md#reported-questions)); *mystery* is the abstract as a verb (`vemayom`) with that clause as its object, so the English subject clause becomes an object.
- **STC-217, *never*, *evidently*:** `hal` is the *never* restrictor; *evidently* is the strong CLUES channel. *Gate* is *door*, and `bohor` binds the door noun, though its nearest same-root word is the verb.
- **STC-218, *cottage girl*:** *little rural girl*; *she said* is a paraphrase cite (`d~[…]`) with the age as a measure on *year* (`bavuvam g+8`).

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
