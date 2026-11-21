% t:0.0 = lk1
% t:0.1 = lk2
% t:0.2 = lk3
% t:0.3 = lk8
% t:0.4 = lk4
% t:1.0 = lk5
% t:2.0 = lk12
% t:2.1 = lk13
% t:2.2 = lk14
% t:2.3 = lk19
% t:2.4 = lk20
% t:3.0 = lk21
% t:4.0 = lk9
% t:5.0 = lk22
% t:6.0 = lk23
% t:6.1 = lk10
% t:6.2 = lk24
% t:6.3 = lk11
% t:6.4 = lk25
% t:7.0 = lk16
% t:8.0 = lk26
% t:8.1 = lk18
% t:9.0 = lk27
% t:10.0 = lk40
% t:11.0 = lk28
% t:12.0 = lk29
% t:13.0 = lk30
% t:14.0 = lk31
% t:15.0 = lk32
% t:16.0 = lk33
% t:17.0 = lk37
% t:18.0 = lk38
% t:19.0 = lk39
% t:19.1 = lk42
% t:19.2 = lk43
% t:19.3 = lk34
% t:19.4 = lk35
% t:19.5 = lk36
% t:19.6 = lk44
% t:19.7 = lk45
% t:19.8 = undefined
% t:19.9 = undefined
% t:19.10 = undefined
% t:19.11 = undefined
% t:19.12 = undefined
% t:20.0 = undefined
% t:20.1 = undefined
% t:21.0 = undefined
% t:21.1 = undefined
% t:22.0 = undefined
% t:22.1 = undefined
% t:22.2 = undefined
% t:23.0 = undefined
% t:23.1 = undefined
% t:24.0 = undefined
% t:24.1 = undefined
% t:24.2 = undefined
% t:24.3 = undefined
% t:24.4 = undefined
% t:24.5 = undefined

% Generic rules (docs/meta/solver.md).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).
% A holder's view (R2-1 row 1, R2-2): one holder's views clash; two holders' never do, nor a view and your claim.
clash(view(H, P)) :- holds(view(H, P)), holds(view(H, neg(P))).
clash(view(H, Q)) :- holds(view(H, neg(Q))), holds(view(H, P)), fits(Q, P).
% Rank and ties (R4c decision 1, R4c-2, D17): a rank one way and the other, or a closed tie and a rank, on one scale.
clash(more(S, B, A)) :- holds(more(S, A, B)), holds(more(S, B, A)).
clash(tie(S, A, B, l)) :- holds(tie(S, A, B, l)), holds(more(S, A, B)).
% A place on a scale (D22): one place per member and scale, and a place below the top denies the top.
clash(place(S, A, M)) :- holds(place(S, A, N)), holds(place(S, A, M)), N != M.
holds(neg(most(S, A))) :- holds(place(S, A, N)), N != rk(1).
fired(place, neg(most(S, A))) :- holds(place(S, A, N)), N != rk(1).
used(place, neg(most(S, A)), place(S, A, N)) :- holds(place(S, A, N)), N != rk(1).
% Say words (R2-7): the same party, part, reach and ending, allow or require against forbid; e clashes with nothing.
clash(say(W, P, R, u, E, T)) :- holds(say(W, P, R, a, E, T)), holds(say(W, P, R, u, E, T)).
clash(say(W, P, R, u, E, T)) :- holds(say(W, P, R, o, E, T)), holds(say(W, P, R, u, E, T)).
clash(say(W, P, R, u, E, Q)) :- holds(say(W, P, R, a, E, T)), holds(say(W, P, R, u, E, Q)), fits(Q, T).
clash(say(W, P, R, u, E, Q)) :- holds(say(W, P, R, o, E, T)), holds(say(W, P, R, u, E, Q)), fits(Q, T).
clash(say(W, P, R, u, E, T, X)) :- holds(say(W, P, R, a, E, T, X)), holds(say(W, P, R, u, E, T, X)).
clash(say(W, P, R, u, E, T, X)) :- holds(say(W, P, R, o, E, T, X)), holds(say(W, P, R, u, E, T, X)).
clash(say(W, P, R, u, E, Q, X)) :- holds(say(W, P, R, a, E, T, X)), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).
clash(say(W, P, R, u, E, Q, X)) :- holds(say(W, P, R, o, E, T, X)), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).
% A requirement gives permission (R2-8).
holds(say(W, P, R, a, E, T)) :- holds(say(W, P, R, o, E, T)).
fired(requires, say(W, P, R, a, E, T)) :- holds(say(W, P, R, o, E, T)).
used(requires, say(W, P, R, a, E, T), say(W, P, R, o, E, T)) :- holds(say(W, P, R, o, E, T)).
holds(say(W, P, R, a, E, T, X)) :- holds(say(W, P, R, o, E, T, X)).
fired(requires, say(W, P, R, a, E, T, X)) :- holds(say(W, P, R, o, E, T, X)).
used(requires, say(W, P, R, a, E, T, X), say(W, P, R, o, E, T, X)) :- holds(say(W, P, R, o, E, T, X)).
% A ban denies the matching permission (permission-consent.md#requirement).
holds(neg(say(W, P, R, a, E, T))) :- holds(say(W, P, R, u, E, T)).
fired(bans, neg(say(W, P, R, a, E, T))) :- holds(say(W, P, R, u, E, T)).
used(bans, neg(say(W, P, R, a, E, T)), say(W, P, R, u, E, T)) :- holds(say(W, P, R, u, E, T)).
holds(neg(say(W, P, R, a, E, Q))) :- holds(say(W, P, R, u, E, T)), fits(T, Q).
fired(bans, neg(say(W, P, R, a, E, Q))) :- holds(say(W, P, R, u, E, T)), fits(T, Q).
used(bans, neg(say(W, P, R, a, E, Q)), say(W, P, R, u, E, T)) :- holds(say(W, P, R, u, E, T)), fits(T, Q).
holds(neg(say(W, P, R, a, E, T, X))) :- holds(say(W, P, R, u, E, T, X)).
fired(bans, neg(say(W, P, R, a, E, T, X))) :- holds(say(W, P, R, u, E, T, X)).
used(bans, neg(say(W, P, R, a, E, T, X)), say(W, P, R, u, E, T, X)) :- holds(say(W, P, R, u, E, T, X)).
holds(neg(say(W, P, R, a, E, Q, X))) :- holds(say(W, P, R, u, E, T, X)), fits(T, Q).
fired(bans, neg(say(W, P, R, a, E, Q, X))) :- holds(say(W, P, R, u, E, T, X)), fits(T, Q).
used(bans, neg(say(W, P, R, a, E, Q, X)), say(W, P, R, u, E, T, X)) :- holds(say(W, P, R, u, E, T, X)), fits(T, Q).
% An act against a stated ban (R2-9): data, never a clash.
holds(against(T, say(W, P, R, u, E))) :- holds(T), holds(say(W, P, R, u, E, T)).
fired(against, against(T, say(W, P, R, u, E))) :- holds(T), holds(say(W, P, R, u, E, T)).
used(against, against(T, say(W, P, R, u, E)), T) :- holds(T), holds(say(W, P, R, u, E, T)).
used(against, against(T, say(W, P, R, u, E)), say(W, P, R, u, E, T)) :- holds(T), holds(say(W, P, R, u, E, T)).
holds(against(T, say(W, P, R, u, E))) :- holds(T), holds(say(W, P, R, u, E, Q)), fits(Q, T).
fired(against, against(T, say(W, P, R, u, E))) :- holds(T), holds(say(W, P, R, u, E, Q)), fits(Q, T).
used(against, against(T, say(W, P, R, u, E)), T) :- holds(T), holds(say(W, P, R, u, E, Q)), fits(Q, T).
used(against, against(T, say(W, P, R, u, E)), say(W, P, R, u, E, Q)) :- holds(T), holds(say(W, P, R, u, E, Q)), fits(Q, T).
holds(against(T, say(W, P, R, u, E, X))) :- holds(T), holds(say(W, P, R, u, E, T, X)).
fired(against, against(T, say(W, P, R, u, E, X))) :- holds(T), holds(say(W, P, R, u, E, T, X)).
used(against, against(T, say(W, P, R, u, E, X)), T) :- holds(T), holds(say(W, P, R, u, E, T, X)).
used(against, against(T, say(W, P, R, u, E, X)), say(W, P, R, u, E, T, X)) :- holds(T), holds(say(W, P, R, u, E, T, X)).
holds(against(T, say(W, P, R, u, E, X))) :- holds(T), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).
fired(against, against(T, say(W, P, R, u, E, X))) :- holds(T), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).
used(against, against(T, say(W, P, R, u, E, X)), T) :- holds(T), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).
used(against, against(T, say(W, P, R, u, E, X)), say(W, P, R, u, E, Q, X)) :- holds(T), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).

% t:0.0
on("t:0.0").
holds(owuro(z(azozo))) :- on("t:0.0").
fired("t:0.0",owuro(z(azozo))) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(eruvo(z(alazu))) :- on("t:0.1").
fired("t:0.1",eruvo(z(alazu))) :- on("t:0.1").
holds(cause(owuro(z(azozo)),eruvo(z(alazu)))) :- on("t:0.1").
fired("t:0.1",cause(owuro(z(azozo)),eruvo(z(alazu)))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(neg(ezuve(z(alazu)))) :- on("t:0.2").
fired("t:0.2",neg(ezuve(z(alazu)))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(eruvo(z(alazu))) :- on("t:0.3").
fired("t:0.3",eruvo(z(alazu))) :- on("t:0.3").
% t:0.4
on("t:0.4").
holds(ehohe(z(azozo))) :- on("t:0.4").
fired("t:0.4",ehohe(z(azozo))) :- on("t:0.4").
% t:1.0
on("t:1.0").
holds(ehohe(z(azozo))) :- on("t:1.0").
fired("t:1.0",ehohe(z(azozo))) :- on("t:1.0").
% t:2.0
on("t:2.0").
% t:2.1
on("t:2.1").
holds(eruvo(z(alazu))) :- on("t:2.1").
fired("t:2.1",eruvo(z(alazu))) :- on("t:2.1").
% t:2.2
on("t:2.2").
holds(ayebe(z(azozo),d(odoze))) :- on("t:2.2").
fired("t:2.2",ayebe(z(azozo),d(odoze))) :- on("t:2.2").
% t:2.3
on("t:2.3").
holds(eruvo(z(odoze))) :- on("t:2.3").
fired("t:2.3",eruvo(z(odoze))) :- on("t:2.3").
% t:2.4
on("t:2.4").
holds(owuro(z(alazu))) :- on("t:2.4").
fired("t:2.4",owuro(z(alazu))) :- on("t:2.4").
% t:3.0
on("t:3.0").
holds(neg(owuro(z(alazu)))) :- on("t:3.0").
fired("t:3.0",neg(owuro(z(alazu)))) :- on("t:3.0").
% t:4.0
on("t:4.0").
holds(owuro(z(azozo))) :- on("t:4.0").
fired("t:4.0",owuro(z(azozo))) :- on("t:4.0").
% t:5.0
on("t:5.0").
holds(owuro(z(azozo))) :- on("t:5.0").
fired("t:5.0",owuro(z(azozo))) :- on("t:5.0").
% t:6.0
on("t:6.0").
holds(isa(nm("t:6.0",z),odoze)) :- on("t:6.0").
fired("t:6.0",isa(nm("t:6.0",z),odoze)) :- on("t:6.0").
holds(isa(nm("t:6.0",d),ugede)) :- on("t:6.0").
fired("t:6.0",isa(nm("t:6.0",d),ugede)) :- on("t:6.0").
holds(ayebe(z(nm("t:6.0",z)),d(nm("t:6.0",d)))) :- on("t:6.0").
fired("t:6.0",ayebe(z(nm("t:6.0",z)),d(nm("t:6.0",d)))) :- on("t:6.0").
% t:6.1
on("t:6.1").
holds(isa(nm("t:6.1",z),ogoze)) :- on("t:6.1").
fired("t:6.1",isa(nm("t:6.1",z),ogoze)) :- on("t:6.1").
holds(ayebe(z(nm("t:6.1",z)),d(nm("t:6.0",z)))) :- on("t:6.1").
fired("t:6.1",ayebe(z(nm("t:6.1",z)),d(nm("t:6.0",z)))) :- on("t:6.1").
% t:6.2
on("t:6.2").
holds(owuro(z(nm("t:6.0",z)))) :- on("t:6.2").
fired("t:6.2",owuro(z(nm("t:6.0",z)))) :- on("t:6.2").
% t:6.3
on("t:6.3").
holds(ezuve(z(X))) :- holds(isa(X,ogoze)), on("t:6.3").
fired("t:6.3",ezuve(z(X))) :- holds(isa(X,ogoze)), on("t:6.3").
used("t:6.3",ezuve(z(X)),isa(X,ogoze)) :- holds(isa(X,ogoze)), on("t:6.3").
% t:6.4
on("t:6.4").
holds(isa(azozo,ogoze)) :- on("t:6.4").
fired("t:6.4",isa(azozo,ogoze)) :- on("t:6.4").
% t:7.0
on("t:7.0").
holds(neg(isa(azozo,ogoze))) :- on("t:7.0").
fired("t:7.0",neg(isa(azozo,ogoze))) :- on("t:7.0").
% t:8.0
on("t:8.0").
holds(owuro(z(ls("t:8.0",z)))) :- on("t:8.0").
fired("t:8.0",owuro(z(ls("t:8.0",z)))) :- on("t:8.0").
holds(owuro(z(X))) :- member(ls("t:8.0",z),X,G), on("t:8.0").
fired("t:8.0",owuro(z(X))) :- member(ls("t:8.0",z),X,G), on("t:8.0").
% t:8.1
on("t:8.1").
holds(ehohe(z(azozo))) :- on("t:8.1").
fired("t:8.1",ehohe(z(azozo))) :- on("t:8.1").
% t:9.0
on("t:9.0").
holds(owuro(z(alazu))) :- on("t:9.0").
fired("t:9.0",owuro(z(alazu))) :- on("t:9.0").
% t:10.0
on("t:10.0").
holds(owuro(z(alazu))) :- on("t:10.0").
fired("t:10.0",owuro(z(alazu))) :- on("t:10.0").
% t:11.0
on("t:11.0").
holds(owuro(z(azozo))) :- on("t:11.0").
fired("t:11.0",owuro(z(azozo))) :- on("t:11.0").
% t:12.0
on("t:12.0").
holds(owuro(z(alazu))) :- on("t:12.0").
fired("t:12.0",owuro(z(alazu))) :- on("t:12.0").
holds(owuro(z(azozo))) :- on("t:12.0").
fired("t:12.0",owuro(z(azozo))) :- on("t:12.0").
% t:13.0
on("t:13.0").
holds(ezuve(z(alazu))) :- on("t:13.0").
fired("t:13.0",ezuve(z(alazu))) :- on("t:13.0").
% t:14.0
on("t:14.0").
% t:15.0
on("t:15.0").
holds(isa(nm("t:15.0",z),uvaya)) :- on("t:15.0").
fired("t:15.0",isa(nm("t:15.0",z),uvaya)) :- on("t:15.0").
holds(owuro(z(nm("t:15.0",z)))) :- on("t:15.0").
fired("t:15.0",owuro(z(nm("t:15.0",z)))) :- on("t:15.0").
% t:16.0
on("t:16.0").
holds(owuro(z(alazu))) :- on("t:16.0").
fired("t:16.0",owuro(z(alazu))) :- on("t:16.0").
% t:17.0
on("t:17.0").
% t:18.0
on("t:18.0").
holds(isa(ahela,odoze)) :- on("t:18.0").
fired("t:18.0",isa(ahela,odoze)) :- on("t:18.0").
% t:19.0
on("t:19.0").
holds(owuro(z(azozo))) :- on("t:19.0").
fired("t:19.0",owuro(z(azozo))) :- on("t:19.0").
holds(isa(ahela,odoze)) :- on("t:19.0").
fired("t:19.0",isa(ahela,odoze)) :- on("t:19.0").
% t:19.1
on("t:19.1").
never(eba(z(listener(24)),w(dt("lexReading:standIn","blarl",cl(avobo(z(we(24)),w(dt("hookJob:extraNoun","al",ohaha,w)))),w)))) :- on("t:19.1").
fired("t:19.1",never(eba(z(listener(24)),w(dt("lexReading:standIn","blarl",cl(avobo(z(we(24)),w(dt("hookJob:extraNoun","al",ohaha,w)))),w))))) :- on("t:19.1").
% t:19.2
on("t:19.2").
holds(ehohe(z(azozo),w(dt("hookJob:extraNoun","el",ohaha,w)))) :- on("t:19.2").
fired("t:19.2",ehohe(z(azozo),w(dt("hookJob:extraNoun","el",ohaha,w)))) :- on("t:19.2").
% t:19.3
on("t:19.3").
holds(ehohe(z(alazu),w(dt("hookJob:extraNoun","el",ohaha,w)))) :- on("t:19.3").
fired("t:19.3",ehohe(z(alazu),w(dt("hookJob:extraNoun","el",ohaha,w)))) :- on("t:19.3").
% t:19.4
on("t:19.4").
holds(ehohe(z(azozo),w(dt("hookJob:extraNoun","el",ohaha,w)))) :- on("t:19.4").
fired("t:19.4",ehohe(z(azozo),w(dt("hookJob:extraNoun","el",ohaha,w)))) :- on("t:19.4").
% t:19.5
on("t:19.5").
holds(neg(ehohe(z(alazu),w(dt("hookJob:extraNoun","el",ohaha,w))))) :- on("t:19.5").
fired("t:19.5",neg(ehohe(z(alazu),w(dt("hookJob:extraNoun","el",ohaha,w))))) :- on("t:19.5").
% t:19.6
on("t:19.6").
holds(isa(nm("t:19.6",d),ana)) :- on("t:19.6").
fired("t:19.6",isa(nm("t:19.6",d),ana)) :- on("t:19.6").
holds(aruyo(z(azozo),d(nm("t:19.6",d)),w(dt("hookJob:extraNoun","aol",abewo,w)))) :- on("t:19.6").
fired("t:19.6",aruyo(z(azozo),d(nm("t:19.6",d)),w(dt("hookJob:extraNoun","aol",abewo,w)))) :- on("t:19.6").
% t:19.7
on("t:19.7").
holds(aruyo(z(alazu),w(dt("hookJob:extraNoun","aol",abewo,w)))) :- on("t:19.7").
fired("t:19.7",aruyo(z(alazu),w(dt("hookJob:extraNoun","aol",abewo,w)))) :- on("t:19.7").
% t:19.8
on("t:19.8").
holds(ehohe(z(alazu))) :- on("t:19.8").
fired("t:19.8",ehohe(z(alazu))) :- on("t:19.8").
% t:19.9
on("t:19.9").
holds(ezuyo(z(azozo),d(cl(ehohe(z(alazu)))))) :- on("t:19.9").
fired("t:19.9",ezuyo(z(azozo),d(cl(ehohe(z(alazu)))))) :- on("t:19.9").
% t:19.10
on("t:19.10").
holds(ezuyo(z(azozo),d(cl(ehohe)),b(alazu))) :- on("t:19.10").
fired("t:19.10",ezuyo(z(azozo),d(cl(ehohe)),b(alazu))) :- on("t:19.10").
% t:19.11
on("t:19.11").
holds(alo(z(alazu),d(cl(ehohe)))) :- on("t:19.11").
fired("t:19.11",alo(z(alazu),d(cl(ehohe)))) :- on("t:19.11").
% t:19.12
holds(eruvo(z(alazu))) :- on("t:19.12").
fired("t:19.12",eruvo(z(alazu))) :- on("t:19.12").
% t:20.0
on("t:20.0").
holds(ezuve(z(alazu))) :- on("t:20.0").
fired("t:20.0",ezuve(z(alazu))) :- on("t:20.0").
% t:20.1
holds(eruvo(z(alazu))) :- on("t:20.1").
fired("t:20.1",eruvo(z(alazu))) :- on("t:20.1").
% t:21.0
on("t:21.0").
holds(ezuve(z(alazu))) :- on("t:21.0").
fired("t:21.0",ezuve(z(alazu))) :- on("t:21.0").
% t:21.1
on("t:21.1").
holds(isa(nm("t:21.1",z),uvaya)) :- on("t:21.1").
fired("t:21.1",isa(nm("t:21.1",z),uvaya)) :- on("t:21.1").
holds(owuro(z(nm("t:21.1",z)))) :- on("t:21.1").
fired("t:21.1",owuro(z(nm("t:21.1",z)))) :- on("t:21.1").
% t:22.0
on("t:22.0").
holds(neg(owuro(z(alazu)))) :- on("t:22.0").
fired("t:22.0",neg(owuro(z(alazu)))) :- on("t:22.0").
% t:22.1
on("t:22.1").
holds(isa(alazu,ebeze)) :- on("t:22.1").
fired("t:22.1",isa(alazu,ebeze)) :- on("t:22.1").
% t:22.2
on("t:22.2").
holds(ewobo(z(X))) :- holds(isa(X,ebeze)), X!=alazu, on("t:22.2").
fired("t:22.2",ewobo(z(X))) :- holds(isa(X,ebeze)), X!=alazu, on("t:22.2").
used("t:22.2",ewobo(z(X)),isa(X,ebeze)) :- holds(isa(X,ebeze)), X!=alazu, on("t:22.2").
% t:23.0
on("t:23.0").
holds(neg(ewobo(z(alazu)))) :- on("t:23.0").
fired("t:23.0",neg(ewobo(z(alazu)))) :- on("t:23.0").
% t:23.1
on("t:23.1").
holds(ewobo(z(ls("t:23.1",z)))) :- on("t:23.1").
fired("t:23.1",ewobo(z(ls("t:23.1",z)))) :- on("t:23.1").
holds(ewobo(z(X))) :- member(ls("t:23.1",z),X,G), X!=alazu, on("t:23.1").
fired("t:23.1",ewobo(z(X))) :- member(ls("t:23.1",z),X,G), X!=alazu, on("t:23.1").
% t:24.0
on("t:24.0").
holds(neg(ewobo(z(alazu)))) :- on("t:24.0").
fired("t:24.0",neg(ewobo(z(alazu)))) :- on("t:24.0").
% t:24.1
on("t:24.1").
holds(isa(nm("t:24.1",d),abeda)) :- on("t:24.1").
fired("t:24.1",isa(nm("t:24.1",d),abeda)) :- on("t:24.1").
holds(ugudo(z(azozo),d(nm("t:24.1",d)))) :- on("t:24.1").
fired("t:24.1",ugudo(z(azozo),d(nm("t:24.1",d)))) :- on("t:24.1").
holds(ozeda(z(azozo),d(nm("t:24.1",d)))) :- on("t:24.1").
fired("t:24.1",ozeda(z(azozo),d(nm("t:24.1",d)))) :- on("t:24.1").
% t:24.2
on("t:24.2").
holds(owuro(z(azozo))) :- on("t:24.2").
fired("t:24.2",owuro(z(azozo))) :- on("t:24.2").
holds(eruvo(z(azozo))) :- on("t:24.2").
fired("t:24.2",eruvo(z(azozo))) :- on("t:24.2").
% t:24.3
on("t:24.3").
holds(owuro(z(X))) :- member(ls("t:24.3",z),X,1), on("t:24.3").
fired("t:24.3",owuro(z(X))) :- member(ls("t:24.3",z),X,1), on("t:24.3").
holds(eruvo(z(X))) :- member(ls("t:24.3",z),X,2), on("t:24.3").
fired("t:24.3",eruvo(z(X))) :- member(ls("t:24.3",z),X,2), on("t:24.3").
% t:24.4
on("t:24.4").
holds(owuro(z(azozo))) :- on("t:24.4").
fired("t:24.4",owuro(z(azozo))) :- on("t:24.4").
holds(eruvo(z(azozo))) :- on("t:24.4").
fired("t:24.4",eruvo(z(azozo))) :- on("t:24.4").
% t:24.5
on("t:24.5").
holds(isa(nm("t:24.5",d1),abeda)) :- on("t:24.5").
fired("t:24.5",isa(nm("t:24.5",d1),abeda)) :- on("t:24.5").
holds(isa(nm("t:24.5",d2),alede)) :- on("t:24.5").
fired("t:24.5",isa(nm("t:24.5",d2),alede)) :- on("t:24.5").
holds(ugudo(z(azozo),d(nm("t:24.5",d1)))) :- on("t:24.5").
fired("t:24.5",ugudo(z(azozo),d(nm("t:24.5",d1)))) :- on("t:24.5").
holds(ozeda(z(azozo),d(nm("t:24.5",d2)))) :- on("t:24.5").
fired("t:24.5",ozeda(z(azozo),d(nm("t:24.5",d2)))) :- on("t:24.5").

% Members, from claimMemberLists().
member(ls("t:8.0",z),odoze,1).
member(ls("t:8.0",z),ogoze,2).
member(ls("t:23.1",z),azozo,1).
member(ls("t:23.1",z),alazu,2).
member(ls("t:24.3",z),azozo,1).
member(ls("t:24.3",z),alazu,2).
