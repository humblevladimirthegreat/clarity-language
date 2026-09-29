# Syntax test corpus

Editors only — not linked from grammar pages. Working sheet for Phase 2a of the expressiveness review (`docs/proposals/expressiveness-review.md`).

Source: *Conlang Syntax Test Cases* (218 sentences culled from *1200 Graded Sentences for Analysis*), originally on fiziwig.com, mirrored at <https://cofl.github.io/conlang/resources/mirror/conlang-syntax-test-cases.html>. Numbering follows the source list; cite rows as `STC-nn`. English is copied verbatim, including the source's typos.

Every Agazan line below was checked with `node scripts/parse.mjs`. `SELFn` is the reader-as-speaker slot ([house cast](grammar-docs.md#house-cast)).

## Translations

| STC | English | Agazan | Morph gloss | Verdict |
|-----|---------|--------|-------------|---------|
| 1 | The sun shines. | `zazahor vabawel.` | z-←sun.full \| v-shine | covered |
| 2 | The sun is shining. | `zazahor thodum vabawel.` | z-←sun.full \| th-LIVE \| v-shine | covered |
| 3 | The sun shone. | `zazahor thunom vabawel.` | z-←sun.full \| th-WITNESSED \| v-shine | covered |
| 4 | The sun will shine. | `zazahor thabem bral vabawel.` | z-←sun.full \| [th-PATTERN \| b-later] \| v-shine | covered |
| 5 | The sun has been shining. | `zazahor thodum hagem vabawel.` | z-←sun.full \| th-LIVE \| h-still \| v-shine | covered |
| 6 | The sun is shining again. | `zazahor thodum herebem vabawel.` | z-←sun.full \| th-LIVE \| h-again \| v-shine | covered |
| 7 | The sun will shine tomorrow. | `zazahor thabem bazazam grawol vabawel.` | z-←sun.full \| [th-PATTERN \| [b-day \| g-one]] \| v-shine | covered |
| 8 | The sun shines brightly. | `zazahor habawel vabawel.` | z-←sun.full \| h-bright \| v-shine | covered |
| 9 | The bright sun shines. | `zazahor gabawel vabawel.` | [z-←sun.full \| g-bright] \| v-shine | covered |
| 10 | The sun is rising now. | `zazahor thodum vabaham.` | z-←sun.full \| th-LIVE \| v-rise | covered |
| 11 | All the people shouted. | `zual gebezal thunom valudel.` | [z-everything \| g-person] \| th-WITNESSED \| v-shout | covered |
| 12 | Some of the people shouted. | `zebezarx gram thunom valudel.` | [z-←person.full-x \| g-more-than-one.about] \| th-WITNESSED \| v-shout | covered |
| 13 | Many of the people shouted twice. | `zebezarx zahen zel gral thunom valudel hradul.` | [z-←person.full-x \| z-Typical \| z-rank/more \| g-amount] \| th-WITNESSED \| v-shout \| h-two | covered |
| 14 | Happy people often shout. | `zebezalx gegevam zahen zel hral valudel.` | [[z-person-x \| g-delight] \| z-Typical \| z-rank/more \| h-how-often] \| v-shout | by design (G-01) |
| 15 | The kitten jumped up. | `zebebexagadar thunom vagugel habaham.` | z-baby-x-cat \| th-WITNESSED \| v-jump \| h-rise | covered |
| 16 | The kitten jumped onto the table. | `zebebexagadar thunom vagugel aol bexagudel.` | z-baby-x-cat \| th-WITNESSED \| v-jump \| [on \| b-scene-x-cutlery] | awkward (L-03) |
| 17 | My little kitten walked away. | `glamazam zebebexagadal em bamegun thunom vowogalum.` | [gl-small \| z-baby-x-cat] \| [used-by \| b-speaker] \| th-WITNESSED \| v-recede | covered |
| 18 | It's raining. | `thodum verehel.` | th-LIVE \| v-rain | covered |
| 19 | The rain came down. | `zerehel thunom vadahel.` | z-rain \| th-WITNESSED \| v-fall | covered |
| 20 | The kitten is playing in the rain. | `zebebexagadar thodum vebogam am berehel.` | z-baby-x-cat \| th-LIVE \| v-play \| [amid \| b-rain] | covered |
| 21 | The rain has stopped. | `thodum hewem verehel.` | th-LIVE \| h-no-longer \| v-rain | covered |
| 22 | Soon the rain will stop. | `thevem brabum hewem verehel.` | [th-INFERRED \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 23 | I hope the rain stops soon. | `thevegem thevem brabum hewem verehel.` | th-hope \| [th-INFERRED \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 24 | Once wild animals lived here. | `zelebelx gelebem om bamegun thunem vahazam.` | [z-leopard-x \| g-nature] \| [near \| b-speaker] \| th-FORMER \| v-home | awkward (L-03) |
| 25 | Slowly she looked around. | `hezehom zalahen thunom vazahem ol bual.` | h-slow \| z-Alahen \| th-WITNESSED \| v-look \| [at \| b-everything] | covered |
| 26 | Go away! | `yel vuvudelum.` | y-command \| v-go-recede | covered |
| 27 | Let's go! | `yem zohan vuvudel.` | y-request \| z-interlocutors \| v-go | covered |
| 28 | You should go. | `zehodon vuvudel thugethem.` | z-listener \| v-go \| th-sake-ought-offered | covered |
| 29 | I will be happy to go. | `zSELFn thumam vuvudel thozuthamam.` | z-SELF \| th-plan-itinerary \| v-go \| th-pleasure-met-any-term-INTERNAL-FLOWING | covered |
| 30 | He will arrive soon. | `zazawan thevem brabum vevahal.` | z-Azawan \| [th-INFERRED \| b-+-e-.about] \| v-arrival | covered |
| 31 | The baby's ball has rolled away. | `zabezol em bebebel thamom vewawelum.` | z-ball \| [used-by \| b-baby] \| th-RESIDUE \| v-wheel-recede | covered |
| 32 | The two boys are working together. | `zobohalx gradul thodum vazewemx.` | [z-boy-x \| g-two] \| th-LIVE \| v-effort-x | covered |
| 33 | This mist will probably clear away. | `zavegal om bamegun thral thevem bral vemehulum.` | z-fog \| [near \| b-speaker] \| th-likely \| [th-INFERRED \| b-later] \| v-melt-recede | covered |
| 34 | Lovely flowers are growing everywhere. | `zavavulx gahabem thodum vezum ol bual.` | [z-flower-x \| g-beauty] \| th-LIVE \| v-growth \| [at \| b-everything] | covered |
| 35 | We should eat more slowly. | `zohan zereben zel hezehom vagudel thugethem.` | [z-interlocutors \| z-Usual \| z-rank/more \| h-slow] \| v-eat \| th-sake-ought-offered | covered |
| 36 | You have come too soon. | `zehodon zugen zuel bral vuvudel oel bamegun.` | [z-listener \| z-Some-sake \| z-rank/less \| b-later] \| v-go \| [toward \| b-speaker] | covered |
| 37 | You must write more neatly. | `zehodon zereben zel hozobam varadal themehom.` | [z-listener \| z-Usual \| z-rank/more \| h-cleanliness] \| v-write \| th-REQUIRE-demanded | covered |
| 38 | Directly opposite stands a wonderful palace. | `honovathohan zagazol gazebam vazadol.` | h-north-th-interlocutors \| [z-castle \| g-amazement] \| v-stand | covered |
| 39 | Henry's dog is lost. | `zodogal gadadom em bazawan.` | [z-dog \| g-loss] \| [used-by \| b-Azawan] | covered |
| 40 | My cat is black. | `zagadal gabagol em bamegun.` | [z-cat \| g-black] \| [used-by \| b-speaker] | covered |
| 41 | The little girl's doll is broken. | `zenezel galazem em begehal gamazam.` | [z-nesting-doll \| g-breakdown] \| [used-by \| [b-girl \| g-small]] | awkward (L-03) |
| 42 | I usually sleep soundly. | `zSELFn hual vezebal hanayam thogol.` | z-SELF \| h-always \| v-sleep \| h-depth \| th-COMMON | covered |
| 43 | The children ran after Jack. | `zahadelx thunom dahaben verezam.` | z-child-x \| th-WITNESSED \| d-Ahaben \| v-pursuit | covered |
| 44 | I can play after school. | `zSELFn vebogaxam hulam buzugul.` | z-SELF \| v-play-able \| [h-after \| b-school] | covered |
| 45 | We went to the village for a visit. | `zohan thunom vuvudel oel bahedem hagom bowogalol.` | z-interlocutors \| th-WITNESSED \| v-go \| [toward \| b-locality] \| [h-so-that \| b-attend] | covered |
| 46 | We arrived at the river. | `zohan thunom vevahal ol bowodel.` | z-interlocutors \| th-WITNESSED \| v-arrival \| [at \| b-drinking-water] | awkward (L-03) |
| 47 | I have been waiting for you. | `zSELFn thodum hagem dehodon vabazem.` | z-SELF \| th-LIVE \| h-still \| d-listener \| v-wait | covered |
| 48 | The campers sat around the fire. | `zaxagabolx thunom vehahel hegozem bavahel.` | z-agent-x-camp-x \| th-WITNESSED \| v-sit \| [h-around \| b-fire] | covered |
| 49 | A little girl with a kitten sat near me. | `glamazam zegehal gan bebebexagadal thunom vehahel om bamegun.` | [gl-small \| z-girl \| [g-including \| b-baby-x-cat]] \| th-WITNESSED \| v-sit \| [near \| b-speaker] | covered |
| 50 | The child waited at the door for her father. | `zahader thunom vabazem ol bodol glemehel debezal grebuwol bahar.` | z-←child.full \| th-WITNESSED \| v-wait \| at \| b-door \| gl-male \| d-person \| g-#-e-1 \| b-←←child.full | covered |

### Notes

- **STC-1–10, *the sun*:** a full-root resume `zazahor` with no antecedent is *the one we both know*, which fits a unique referent. No article gap.
- **STC-1:** read as a plain report. A general truth (*the sun shines, as a rule*) would add *always* `hual`.
- **STC-2–7, tense:** by design (no tense letter). The progressive is LIVE, the past is WITNESSED, and the future is a channel + `bral`. *Tomorrow* is the day offset +1 on that channel. Each forecast has to choose a warrant; PATTERN is the honest one for sunrise.
- **STC-5, *has been shining*:** *still* `hagem` carries "began earlier, goes on now". The English duration-up-to-now is only implied; a measured duration would need a measure phrase.
- **STC-10, *now*:** LIVE already means "in view now" and takes no zero offset, so there is no separate *now* word.
- **STC-8:** with `v:shine` on *bright*, `habawel vabawel` reads *shines brightly*, like the English.
- **STC-11–13, *the people*:** `zual gebezal` with no place hook is every person the situation is about. *Some of* / *many of* resume the known group (`zebezarx`) and give the amount, per the denominator recipe; *many* names the Typical bar.
- **STC-15–20, *kitten*:** a live compound, *baby* `x` *cat* (`ebebexagada`); later mentions resume it in full.
- **STC-17, 26, 31, 33, *away*:** hook compound with `um` (*recede*) on the motion verb: `vowogalum`, `vuvudelum`, `vewawelum`, `vemehulum`.
- **STC-19, 21:** *came down* is *fall*; *has stopped* is *no longer* `hewem` (the rain no longer falls), so no *stop* verb is needed.
- **STC-24, *once*:** FORMER `thunem` (a past climate, not today's). *Here* is `om bamegun`.
- **STC-28, *should*:** prescription with the unnamed sake, `thugethem`. **STC-37, *must*:** `themehom`.
- **STC-29, *happy to*:** emotion compose on `/th/`: pleasure met, INTERNAL, FLOWING (`thozuthamam`) — the speaker's own feeling, so no holder is needed.
- **STC-33, *probably*:** stance number `thral` (*likely*, no figure).
- **STC-38, *opposite*:** `honovathohan` — in front, as the two of us face. *Directly* is dropped.
- **STC-45, *village*:** *hut* in its abstract sense, `bahedem` (*locality*). *For a visit* is `hagom` + the *attend* compound as a noun.
- **STC-47, *wait for you*:** the awaited person is the object.
- **STC-50, *her father*:** kin number `grebuwol` (the layer above) + `/b/` the child, with *male* before it. Long, but every piece is taught.

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
