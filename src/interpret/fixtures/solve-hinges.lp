% t:0.0 = h1
% t:0.1 = h2
% t:0.2 = h3
% t:0.3 = h1o
% t:0.4 = h1i
% t:0.5 = h4
% t:0.6 = hg1
% t:0.7 = hg2
% t:0.8 = hg3
% t:0.9 = hg4
% t:0.10 = hg5
% t:0.11 = hg6
% t:0.12 = hg7
% t:0.13 = hg8
% t:0.14 = hg9
% t:0.15 = hg10
% t:0.16 = hg12
% t:0.17 = hg17
% t:0.18 = hg18
% t:0.19 = hg19
% t:0.20 = hg20
% t:0.21 = hg21
% t:0.22 = hg16
% t:0.23 = hg13
% t:0.24 = hg14
% t:0.25 = hg15
% t:0.26 = bc32
% t:0.27 = bc33
% t:0.28 = bc34
% t:0.29 = bc35
% t:0.30 = bc37
% t:0.31 = bc38
% t:0.32 = bc39
% t:0.33 = bc40

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
holds(if(c("t:0.0"),o("t:0.0"))) :- on("t:0.0").
fired("t:0.0",if(c("t:0.0"),o("t:0.0"))) :- on("t:0.0").
holds(ehohe(z(alazu))) :- holds(if(c("t:0.0"),o("t:0.0"))), fits(c("t:0.0"),P), holds(P), on("t:0.0").
fired("t:0.0",ehohe(z(alazu))) :- holds(if(c("t:0.0"),o("t:0.0"))), fits(c("t:0.0"),P), holds(P), on("t:0.0").
used("t:0.0",ehohe(z(alazu)),if(c("t:0.0"),o("t:0.0"))) :- holds(if(c("t:0.0"),o("t:0.0"))), fits(c("t:0.0"),P), holds(P), on("t:0.0").
used("t:0.0",ehohe(z(alazu)),P) :- holds(if(c("t:0.0"),o("t:0.0"))), fits(c("t:0.0"),P), holds(P), on("t:0.0").
holds(neg(owuro(z(azozo)))) :- holds(if(c("t:0.0"),o("t:0.0"))), fits(P,o("t:0.0")), holds(neg(P)), on("t:0.0").
fired("t:0.0",neg(owuro(z(azozo)))) :- holds(if(c("t:0.0"),o("t:0.0"))), fits(P,o("t:0.0")), holds(neg(P)), on("t:0.0").
used("t:0.0",neg(owuro(z(azozo))),if(c("t:0.0"),o("t:0.0"))) :- holds(if(c("t:0.0"),o("t:0.0"))), fits(P,o("t:0.0")), holds(neg(P)), on("t:0.0").
used("t:0.0",neg(owuro(z(azozo))),neg(P)) :- holds(if(c("t:0.0"),o("t:0.0"))), fits(P,o("t:0.0")), holds(neg(P)), on("t:0.0").
% t:0.1
on("t:0.1").
holds(if(c("t:0.1"),o("t:0.1"))) :- on("t:0.1").
fired("t:0.1",if(c("t:0.1"),o("t:0.1"))) :- on("t:0.1").
holds(ezuve(z(ahela))) :- holds(if(c("t:0.1"),o("t:0.1"))), fits(c("t:0.1"),P), holds(P), on("t:0.1").
fired("t:0.1",ezuve(z(ahela))) :- holds(if(c("t:0.1"),o("t:0.1"))), fits(c("t:0.1"),P), holds(P), on("t:0.1").
used("t:0.1",ezuve(z(ahela)),if(c("t:0.1"),o("t:0.1"))) :- holds(if(c("t:0.1"),o("t:0.1"))), fits(c("t:0.1"),P), holds(P), on("t:0.1").
used("t:0.1",ezuve(z(ahela)),P) :- holds(if(c("t:0.1"),o("t:0.1"))), fits(c("t:0.1"),P), holds(P), on("t:0.1").
holds(neg(ehohe(z(alazu)))) :- holds(if(c("t:0.1"),o("t:0.1"))), fits(P,o("t:0.1")), holds(neg(P)), on("t:0.1").
fired("t:0.1",neg(ehohe(z(alazu)))) :- holds(if(c("t:0.1"),o("t:0.1"))), fits(P,o("t:0.1")), holds(neg(P)), on("t:0.1").
used("t:0.1",neg(ehohe(z(alazu))),if(c("t:0.1"),o("t:0.1"))) :- holds(if(c("t:0.1"),o("t:0.1"))), fits(P,o("t:0.1")), holds(neg(P)), on("t:0.1").
used("t:0.1",neg(ehohe(z(alazu))),neg(P)) :- holds(if(c("t:0.1"),o("t:0.1"))), fits(P,o("t:0.1")), holds(neg(P)), on("t:0.1").
% t:0.2
on("t:0.2").
holds(owuro(z(azozo))) :- on("t:0.2").
fired("t:0.2",owuro(z(azozo))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(onlyif(c("t:0.3"),o("t:0.3"))) :- on("t:0.3").
fired("t:0.3",onlyif(c("t:0.3"),o("t:0.3"))) :- on("t:0.3").
holds(neg(ehohe(z(alazu)))) :- holds(onlyif(c("t:0.3"),o("t:0.3"))), fits(P,c("t:0.3")), holds(neg(P)), on("t:0.3").
fired("t:0.3",neg(ehohe(z(alazu)))) :- holds(onlyif(c("t:0.3"),o("t:0.3"))), fits(P,c("t:0.3")), holds(neg(P)), on("t:0.3").
used("t:0.3",neg(ehohe(z(alazu))),onlyif(c("t:0.3"),o("t:0.3"))) :- holds(onlyif(c("t:0.3"),o("t:0.3"))), fits(P,c("t:0.3")), holds(neg(P)), on("t:0.3").
used("t:0.3",neg(ehohe(z(alazu))),neg(P)) :- holds(onlyif(c("t:0.3"),o("t:0.3"))), fits(P,c("t:0.3")), holds(neg(P)), on("t:0.3").
holds(owuro(z(azozo))) :- holds(onlyif(c("t:0.3"),o("t:0.3"))), fits(o("t:0.3"),P), holds(P), on("t:0.3").
fired("t:0.3",owuro(z(azozo))) :- holds(onlyif(c("t:0.3"),o("t:0.3"))), fits(o("t:0.3"),P), holds(P), on("t:0.3").
used("t:0.3",owuro(z(azozo)),onlyif(c("t:0.3"),o("t:0.3"))) :- holds(onlyif(c("t:0.3"),o("t:0.3"))), fits(o("t:0.3"),P), holds(P), on("t:0.3").
used("t:0.3",owuro(z(azozo)),P) :- holds(onlyif(c("t:0.3"),o("t:0.3"))), fits(o("t:0.3"),P), holds(P), on("t:0.3").
% t:0.4
on("t:0.4").
holds(iff(c("t:0.4"),o("t:0.4"))) :- on("t:0.4").
fired("t:0.4",iff(c("t:0.4"),o("t:0.4"))) :- on("t:0.4").
holds(ehohe(z(alazu))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(c("t:0.4"),P), holds(P), on("t:0.4").
fired("t:0.4",ehohe(z(alazu))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(c("t:0.4"),P), holds(P), on("t:0.4").
used("t:0.4",ehohe(z(alazu)),iff(c("t:0.4"),o("t:0.4"))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(c("t:0.4"),P), holds(P), on("t:0.4").
used("t:0.4",ehohe(z(alazu)),P) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(c("t:0.4"),P), holds(P), on("t:0.4").
holds(neg(owuro(z(azozo)))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(P,o("t:0.4")), holds(neg(P)), on("t:0.4").
fired("t:0.4",neg(owuro(z(azozo)))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(P,o("t:0.4")), holds(neg(P)), on("t:0.4").
used("t:0.4",neg(owuro(z(azozo))),iff(c("t:0.4"),o("t:0.4"))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(P,o("t:0.4")), holds(neg(P)), on("t:0.4").
used("t:0.4",neg(owuro(z(azozo))),neg(P)) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(P,o("t:0.4")), holds(neg(P)), on("t:0.4").
holds(neg(ehohe(z(alazu)))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(P,c("t:0.4")), holds(neg(P)), on("t:0.4").
fired("t:0.4",neg(ehohe(z(alazu)))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(P,c("t:0.4")), holds(neg(P)), on("t:0.4").
used("t:0.4",neg(ehohe(z(alazu))),iff(c("t:0.4"),o("t:0.4"))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(P,c("t:0.4")), holds(neg(P)), on("t:0.4").
used("t:0.4",neg(ehohe(z(alazu))),neg(P)) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(P,c("t:0.4")), holds(neg(P)), on("t:0.4").
holds(owuro(z(azozo))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(o("t:0.4"),P), holds(P), on("t:0.4").
fired("t:0.4",owuro(z(azozo))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(o("t:0.4"),P), holds(P), on("t:0.4").
used("t:0.4",owuro(z(azozo)),iff(c("t:0.4"),o("t:0.4"))) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(o("t:0.4"),P), holds(P), on("t:0.4").
used("t:0.4",owuro(z(azozo)),P) :- holds(iff(c("t:0.4"),o("t:0.4"))), fits(o("t:0.4"),P), holds(P), on("t:0.4").
% t:0.5
on("t:0.5").
holds(neg(owuro(z(azozo)))) :- on("t:0.5").
fired("t:0.5",neg(owuro(z(azozo)))) :- on("t:0.5").
% t:0.6
on("t:0.6").
holds(if(c("t:0.6"),o("t:0.6"))) :- on("t:0.6").
fired("t:0.6",if(c("t:0.6"),o("t:0.6"))) :- on("t:0.6").
holds(ehohe(z(alazu))) :- holds(if(c("t:0.6"),o("t:0.6"))), fits(c("t:0.6"),P), holds(P), on("t:0.6").
fired("t:0.6",ehohe(z(alazu))) :- holds(if(c("t:0.6"),o("t:0.6"))), fits(c("t:0.6"),P), holds(P), on("t:0.6").
used("t:0.6",ehohe(z(alazu)),if(c("t:0.6"),o("t:0.6"))) :- holds(if(c("t:0.6"),o("t:0.6"))), fits(c("t:0.6"),P), holds(P), on("t:0.6").
used("t:0.6",ehohe(z(alazu)),P) :- holds(if(c("t:0.6"),o("t:0.6"))), fits(c("t:0.6"),P), holds(P), on("t:0.6").
holds(neg(owuro(z(azozo)))) :- holds(if(c("t:0.6"),o("t:0.6"))), fits(P,o("t:0.6")), holds(neg(P)), on("t:0.6").
fired("t:0.6",neg(owuro(z(azozo)))) :- holds(if(c("t:0.6"),o("t:0.6"))), fits(P,o("t:0.6")), holds(neg(P)), on("t:0.6").
used("t:0.6",neg(owuro(z(azozo))),if(c("t:0.6"),o("t:0.6"))) :- holds(if(c("t:0.6"),o("t:0.6"))), fits(P,o("t:0.6")), holds(neg(P)), on("t:0.6").
used("t:0.6",neg(owuro(z(azozo))),neg(P)) :- holds(if(c("t:0.6"),o("t:0.6"))), fits(P,o("t:0.6")), holds(neg(P)), on("t:0.6").
% t:0.7
on("t:0.7").
holds(owuro(z(azozo))) :- on("t:0.7").
fired("t:0.7",owuro(z(azozo))) :- on("t:0.7").
% t:0.8
on("t:0.8").
holds(onlyif(c("t:0.8"),o("t:0.8"))) :- on("t:0.8").
fired("t:0.8",onlyif(c("t:0.8"),o("t:0.8"))) :- on("t:0.8").
holds(neg(owuro(z(azozo)))) :- holds(onlyif(c("t:0.8"),o("t:0.8"))), fits(P,c("t:0.8")), holds(neg(P)), on("t:0.8").
fired("t:0.8",neg(owuro(z(azozo)))) :- holds(onlyif(c("t:0.8"),o("t:0.8"))), fits(P,c("t:0.8")), holds(neg(P)), on("t:0.8").
used("t:0.8",neg(owuro(z(azozo))),onlyif(c("t:0.8"),o("t:0.8"))) :- holds(onlyif(c("t:0.8"),o("t:0.8"))), fits(P,c("t:0.8")), holds(neg(P)), on("t:0.8").
used("t:0.8",neg(owuro(z(azozo))),neg(P)) :- holds(onlyif(c("t:0.8"),o("t:0.8"))), fits(P,c("t:0.8")), holds(neg(P)), on("t:0.8").
holds(ehohe(z(alazu))) :- holds(onlyif(c("t:0.8"),o("t:0.8"))), fits(o("t:0.8"),P), holds(P), on("t:0.8").
fired("t:0.8",ehohe(z(alazu))) :- holds(onlyif(c("t:0.8"),o("t:0.8"))), fits(o("t:0.8"),P), holds(P), on("t:0.8").
used("t:0.8",ehohe(z(alazu)),onlyif(c("t:0.8"),o("t:0.8"))) :- holds(onlyif(c("t:0.8"),o("t:0.8"))), fits(o("t:0.8"),P), holds(P), on("t:0.8").
used("t:0.8",ehohe(z(alazu)),P) :- holds(onlyif(c("t:0.8"),o("t:0.8"))), fits(o("t:0.8"),P), holds(P), on("t:0.8").
% t:0.9
on("t:0.9").
holds(iff(c("t:0.9"),o("t:0.9"))) :- on("t:0.9").
fired("t:0.9",iff(c("t:0.9"),o("t:0.9"))) :- on("t:0.9").
holds(ehohe(z(alazu))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(c("t:0.9"),P), holds(P), on("t:0.9").
fired("t:0.9",ehohe(z(alazu))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(c("t:0.9"),P), holds(P), on("t:0.9").
used("t:0.9",ehohe(z(alazu)),iff(c("t:0.9"),o("t:0.9"))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(c("t:0.9"),P), holds(P), on("t:0.9").
used("t:0.9",ehohe(z(alazu)),P) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(c("t:0.9"),P), holds(P), on("t:0.9").
holds(neg(owuro(z(azozo)))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(P,o("t:0.9")), holds(neg(P)), on("t:0.9").
fired("t:0.9",neg(owuro(z(azozo)))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(P,o("t:0.9")), holds(neg(P)), on("t:0.9").
used("t:0.9",neg(owuro(z(azozo))),iff(c("t:0.9"),o("t:0.9"))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(P,o("t:0.9")), holds(neg(P)), on("t:0.9").
used("t:0.9",neg(owuro(z(azozo))),neg(P)) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(P,o("t:0.9")), holds(neg(P)), on("t:0.9").
holds(neg(ehohe(z(alazu)))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(P,c("t:0.9")), holds(neg(P)), on("t:0.9").
fired("t:0.9",neg(ehohe(z(alazu)))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(P,c("t:0.9")), holds(neg(P)), on("t:0.9").
used("t:0.9",neg(ehohe(z(alazu))),iff(c("t:0.9"),o("t:0.9"))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(P,c("t:0.9")), holds(neg(P)), on("t:0.9").
used("t:0.9",neg(ehohe(z(alazu))),neg(P)) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(P,c("t:0.9")), holds(neg(P)), on("t:0.9").
holds(owuro(z(azozo))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(o("t:0.9"),P), holds(P), on("t:0.9").
fired("t:0.9",owuro(z(azozo))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(o("t:0.9"),P), holds(P), on("t:0.9").
used("t:0.9",owuro(z(azozo)),iff(c("t:0.9"),o("t:0.9"))) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(o("t:0.9"),P), holds(P), on("t:0.9").
used("t:0.9",owuro(z(azozo)),P) :- holds(iff(c("t:0.9"),o("t:0.9"))), fits(o("t:0.9"),P), holds(P), on("t:0.9").
% t:0.10
on("t:0.10").
holds(if(c("t:0.10"),o("t:0.10"))) :- on("t:0.10").
fired("t:0.10",if(c("t:0.10"),o("t:0.10"))) :- on("t:0.10").
holds(ehohe(z(alazu))) :- holds(if(c("t:0.10"),o("t:0.10"))), fits(c("t:0.10"),P), holds(P), on("t:0.10").
fired("t:0.10",ehohe(z(alazu))) :- holds(if(c("t:0.10"),o("t:0.10"))), fits(c("t:0.10"),P), holds(P), on("t:0.10").
used("t:0.10",ehohe(z(alazu)),if(c("t:0.10"),o("t:0.10"))) :- holds(if(c("t:0.10"),o("t:0.10"))), fits(c("t:0.10"),P), holds(P), on("t:0.10").
used("t:0.10",ehohe(z(alazu)),P) :- holds(if(c("t:0.10"),o("t:0.10"))), fits(c("t:0.10"),P), holds(P), on("t:0.10").
holds(neg(owuro(z(odoze)))) :- holds(if(c("t:0.10"),o("t:0.10"))), fits(P,o("t:0.10")), holds(neg(P)), on("t:0.10").
fired("t:0.10",neg(owuro(z(odoze)))) :- holds(if(c("t:0.10"),o("t:0.10"))), fits(P,o("t:0.10")), holds(neg(P)), on("t:0.10").
used("t:0.10",neg(owuro(z(odoze))),if(c("t:0.10"),o("t:0.10"))) :- holds(if(c("t:0.10"),o("t:0.10"))), fits(P,o("t:0.10")), holds(neg(P)), on("t:0.10").
used("t:0.10",neg(owuro(z(odoze))),neg(P)) :- holds(if(c("t:0.10"),o("t:0.10"))), fits(P,o("t:0.10")), holds(neg(P)), on("t:0.10").
% t:0.11
on("t:0.11").
holds(neg(if(c("t:0.11"),o("t:0.11")))) :- on("t:0.11").
fired("t:0.11",neg(if(c("t:0.11"),o("t:0.11")))) :- on("t:0.11").
% t:0.12
on("t:0.12").
holds(isa(nm("t:0.12",z),odoze)) :- on("t:0.12").
fired("t:0.12",isa(nm("t:0.12",z),odoze)) :- on("t:0.12").
holds(owuro(z(nm("t:0.12",z)))) :- on("t:0.12").
fired("t:0.12",owuro(z(nm("t:0.12",z)))) :- on("t:0.12").
% t:0.13
on("t:0.13").
holds(neg(if(c("t:0.13"),o("t:0.13")))) :- on("t:0.13").
fired("t:0.13",neg(if(c("t:0.13"),o("t:0.13")))) :- on("t:0.13").
% t:0.14
on("t:0.14").
holds(neg(onlyif(c("t:0.14"),o("t:0.14")))) :- on("t:0.14").
fired("t:0.14",neg(onlyif(c("t:0.14"),o("t:0.14")))) :- on("t:0.14").
% t:0.15
on("t:0.15").
holds(neg(iff(c("t:0.15"),o("t:0.15")))) :- on("t:0.15").
fired("t:0.15",neg(iff(c("t:0.15"),o("t:0.15")))) :- on("t:0.15").
% t:0.16
on("t:0.16").
holds(if(c("t:0.16"),o("t:0.16"))) :- on("t:0.16").
fired("t:0.16",if(c("t:0.16"),o("t:0.16"))) :- on("t:0.16").
holds(ezuve(z(ahela))) :- holds(if(c("t:0.16"),o("t:0.16"))), fits(c("t:0.16"),P), holds(P), on("t:0.16").
fired("t:0.16",ezuve(z(ahela))) :- holds(if(c("t:0.16"),o("t:0.16"))), fits(c("t:0.16"),P), holds(P), on("t:0.16").
used("t:0.16",ezuve(z(ahela)),if(c("t:0.16"),o("t:0.16"))) :- holds(if(c("t:0.16"),o("t:0.16"))), fits(c("t:0.16"),P), holds(P), on("t:0.16").
used("t:0.16",ezuve(z(ahela)),P) :- holds(if(c("t:0.16"),o("t:0.16"))), fits(c("t:0.16"),P), holds(P), on("t:0.16").
holds(neg(ehohe(z(alazu)))) :- holds(if(c("t:0.16"),o("t:0.16"))), fits(P,o("t:0.16")), holds(neg(P)), on("t:0.16").
fired("t:0.16",neg(ehohe(z(alazu)))) :- holds(if(c("t:0.16"),o("t:0.16"))), fits(P,o("t:0.16")), holds(neg(P)), on("t:0.16").
used("t:0.16",neg(ehohe(z(alazu))),if(c("t:0.16"),o("t:0.16"))) :- holds(if(c("t:0.16"),o("t:0.16"))), fits(P,o("t:0.16")), holds(neg(P)), on("t:0.16").
used("t:0.16",neg(ehohe(z(alazu))),neg(P)) :- holds(if(c("t:0.16"),o("t:0.16"))), fits(P,o("t:0.16")), holds(neg(P)), on("t:0.16").
% t:0.17
on("t:0.17").
holds(if(c("t:0.17"),o("t:0.17"))) :- on("t:0.17").
fired("t:0.17",if(c("t:0.17"),o("t:0.17"))) :- on("t:0.17").
holds(isa(nm("t:0.17",z),erula)) :- holds(if(c("t:0.17"),o("t:0.17"))), fits(c("t:0.17"),P), holds(P), on("t:0.17").
fired("t:0.17",isa(nm("t:0.17",z),erula)) :- holds(if(c("t:0.17"),o("t:0.17"))), fits(c("t:0.17"),P), holds(P), on("t:0.17").
used("t:0.17",isa(nm("t:0.17",z),erula),if(c("t:0.17"),o("t:0.17"))) :- holds(if(c("t:0.17"),o("t:0.17"))), fits(c("t:0.17"),P), holds(P), on("t:0.17").
used("t:0.17",isa(nm("t:0.17",z),erula),P) :- holds(if(c("t:0.17"),o("t:0.17"))), fits(c("t:0.17"),P), holds(P), on("t:0.17").
% t:0.18
on("t:0.18").
holds(isa(nm("t:0.18",z),ugala)) :- on("t:0.18").
fired("t:0.18",isa(nm("t:0.18",z),ugala)) :- on("t:0.18").
holds(be(z(nm("t:0.18",z)))) :- on("t:0.18").
fired("t:0.18",be(z(nm("t:0.18",z)))) :- on("t:0.18").
% t:0.19
on("t:0.19").
holds(onlyif(c("t:0.19"),o("t:0.19"))) :- on("t:0.19").
fired("t:0.19",onlyif(c("t:0.19"),o("t:0.19"))) :- on("t:0.19").
holds(isa(nm("t:0.19",bl),ugala)) :- holds(onlyif(c("t:0.19"),o("t:0.19"))), fits(o("t:0.19"),P), holds(P), on("t:0.19").
fired("t:0.19",isa(nm("t:0.19",bl),ugala)) :- holds(onlyif(c("t:0.19"),o("t:0.19"))), fits(o("t:0.19"),P), holds(P), on("t:0.19").
used("t:0.19",isa(nm("t:0.19",bl),ugala),onlyif(c("t:0.19"),o("t:0.19"))) :- holds(onlyif(c("t:0.19"),o("t:0.19"))), fits(o("t:0.19"),P), holds(P), on("t:0.19").
used("t:0.19",isa(nm("t:0.19",bl),ugala),P) :- holds(onlyif(c("t:0.19"),o("t:0.19"))), fits(o("t:0.19"),P), holds(P), on("t:0.19").
% t:0.20
on("t:0.20").
holds(isa(nm("t:0.20",z),erula)) :- on("t:0.20").
fired("t:0.20",isa(nm("t:0.20",z),erula)) :- on("t:0.20").
holds(be(z(nm("t:0.20",z)))) :- on("t:0.20").
fired("t:0.20",be(z(nm("t:0.20",z)))) :- on("t:0.20").
% t:0.21
on("t:0.21").
holds(isa(nm("t:0.21",z),erula)) :- on("t:0.21").
fired("t:0.21",isa(nm("t:0.21",z),erula)) :- on("t:0.21").
holds(isa(nm("t:0.21",bl),ugala)) :- on("t:0.21").
fired("t:0.21",isa(nm("t:0.21",bl),ugala)) :- on("t:0.21").
holds(cause(isa(nm("t:0.21",bl),ugala),isa(nm("t:0.21",z),erula))) :- on("t:0.21").
fired("t:0.21",cause(isa(nm("t:0.21",bl),ugala),isa(nm("t:0.21",z),erula))) :- on("t:0.21").
% t:0.22
on("t:0.22").
{ holds(if(c("t:0.22"),o("t:0.22"))) } :- on("t:0.22").
fired("t:0.22",if(c("t:0.22"),o("t:0.22"))) :- holds(if(c("t:0.22"),o("t:0.22"))), on("t:0.22").
holds(may(if(c("t:0.22"),o("t:0.22")))) :- on("t:0.22").
fired("t:0.22",may(if(c("t:0.22"),o("t:0.22")))) :- on("t:0.22").
holds(ehohe(z(alazu))) :- holds(if(c("t:0.22"),o("t:0.22"))), fits(c("t:0.22"),P), holds(P), on("t:0.22").
fired("t:0.22",ehohe(z(alazu))) :- holds(if(c("t:0.22"),o("t:0.22"))), fits(c("t:0.22"),P), holds(P), on("t:0.22").
used("t:0.22",ehohe(z(alazu)),if(c("t:0.22"),o("t:0.22"))) :- holds(if(c("t:0.22"),o("t:0.22"))), fits(c("t:0.22"),P), holds(P), on("t:0.22").
used("t:0.22",ehohe(z(alazu)),P) :- holds(if(c("t:0.22"),o("t:0.22"))), fits(c("t:0.22"),P), holds(P), on("t:0.22").
holds(neg(owuro(z(azozo)))) :- holds(if(c("t:0.22"),o("t:0.22"))), fits(P,o("t:0.22")), holds(neg(P)), on("t:0.22").
fired("t:0.22",neg(owuro(z(azozo)))) :- holds(if(c("t:0.22"),o("t:0.22"))), fits(P,o("t:0.22")), holds(neg(P)), on("t:0.22").
used("t:0.22",neg(owuro(z(azozo))),if(c("t:0.22"),o("t:0.22"))) :- holds(if(c("t:0.22"),o("t:0.22"))), fits(P,o("t:0.22")), holds(neg(P)), on("t:0.22").
used("t:0.22",neg(owuro(z(azozo))),neg(P)) :- holds(if(c("t:0.22"),o("t:0.22"))), fits(P,o("t:0.22")), holds(neg(P)), on("t:0.22").
% t:0.23
on("t:0.23").
via("t:0.23",clues) :- on("t:0.23").
fired("t:0.23",via("t:0.23",clues)) :- on("t:0.23").
holds(view(azozo,if(c("t:0.23"),o("t:0.23")))) :- on("t:0.23").
fired("t:0.23",view(azozo,if(c("t:0.23"),o("t:0.23")))) :- on("t:0.23").
holds(view(azozo,ehohe(z(alazu)))) :- holds(view(azozo,if(c("t:0.23"),o("t:0.23")))), fits(c("t:0.23"),P), holds(view(azozo,P)), on("t:0.23").
fired("t:0.23",view(azozo,ehohe(z(alazu)))) :- holds(view(azozo,if(c("t:0.23"),o("t:0.23")))), fits(c("t:0.23"),P), holds(view(azozo,P)), on("t:0.23").
used("t:0.23",view(azozo,ehohe(z(alazu))),view(azozo,if(c("t:0.23"),o("t:0.23")))) :- holds(view(azozo,if(c("t:0.23"),o("t:0.23")))), fits(c("t:0.23"),P), holds(view(azozo,P)), on("t:0.23").
used("t:0.23",view(azozo,ehohe(z(alazu))),view(azozo,P)) :- holds(view(azozo,if(c("t:0.23"),o("t:0.23")))), fits(c("t:0.23"),P), holds(view(azozo,P)), on("t:0.23").
holds(view(azozo,neg(owuro(z(azozo))))) :- holds(view(azozo,if(c("t:0.23"),o("t:0.23")))), fits(P,o("t:0.23")), holds(view(azozo,neg(P))), on("t:0.23").
fired("t:0.23",view(azozo,neg(owuro(z(azozo))))) :- holds(view(azozo,if(c("t:0.23"),o("t:0.23")))), fits(P,o("t:0.23")), holds(view(azozo,neg(P))), on("t:0.23").
used("t:0.23",view(azozo,neg(owuro(z(azozo)))),view(azozo,if(c("t:0.23"),o("t:0.23")))) :- holds(view(azozo,if(c("t:0.23"),o("t:0.23")))), fits(P,o("t:0.23")), holds(view(azozo,neg(P))), on("t:0.23").
used("t:0.23",view(azozo,neg(owuro(z(azozo)))),view(azozo,neg(P))) :- holds(view(azozo,if(c("t:0.23"),o("t:0.23")))), fits(P,o("t:0.23")), holds(view(azozo,neg(P))), on("t:0.23").
% t:0.24
on("t:0.24").
via("t:0.24",clues) :- on("t:0.24").
fired("t:0.24",via("t:0.24",clues)) :- on("t:0.24").
holds(view(azozo,owuro(z(azozo)))) :- on("t:0.24").
fired("t:0.24",view(azozo,owuro(z(azozo)))) :- on("t:0.24").
% t:0.25
on("t:0.25").
via("t:0.25",clues) :- on("t:0.25").
fired("t:0.25",via("t:0.25",clues)) :- on("t:0.25").
holds(view(azozo,neg(if(c("t:0.25"),o("t:0.25"))))) :- on("t:0.25").
fired("t:0.25",view(azozo,neg(if(c("t:0.25"),o("t:0.25"))))) :- on("t:0.25").
% t:0.26
on("t:0.26").
via("t:0.26",clues) :- on("t:0.26").
fired("t:0.26",via("t:0.26",clues)) :- on("t:0.26").
holds(view(azozo,if(c("t:0.26"),o("t:0.26")))) :- on("t:0.26").
fired("t:0.26",view(azozo,if(c("t:0.26"),o("t:0.26")))) :- on("t:0.26").
holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))) :- holds(view(azozo,if(c("t:0.26"),o("t:0.26")))), holds(view(azozo,isa(X,ogoze))), on("t:0.26").
fired("t:0.26",view(azozo,if(c("t:0.26",X),o("t:0.26",X)))) :- holds(view(azozo,if(c("t:0.26"),o("t:0.26")))), holds(view(azozo,isa(X,ogoze))), on("t:0.26").
used("t:0.26",view(azozo,if(c("t:0.26",X),o("t:0.26",X))),view(azozo,if(c("t:0.26"),o("t:0.26")))) :- holds(view(azozo,if(c("t:0.26"),o("t:0.26")))), holds(view(azozo,isa(X,ogoze))), on("t:0.26").
used("t:0.26",view(azozo,if(c("t:0.26",X),o("t:0.26",X))),view(azozo,isa(X,ogoze))) :- holds(view(azozo,if(c("t:0.26"),o("t:0.26")))), holds(view(azozo,isa(X,ogoze))), on("t:0.26").
holds(view(azozo,ezuve(z(X)))) :- holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))), holds(view(azozo,isa(X,ogoze))), fits(c("t:0.26",X),P), holds(view(azozo,P)), on("t:0.26").
fired("t:0.26",view(azozo,ezuve(z(X)))) :- holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))), holds(view(azozo,isa(X,ogoze))), fits(c("t:0.26",X),P), holds(view(azozo,P)), on("t:0.26").
used("t:0.26",view(azozo,ezuve(z(X))),view(azozo,if(c("t:0.26",X),o("t:0.26",X)))) :- holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))), holds(view(azozo,isa(X,ogoze))), fits(c("t:0.26",X),P), holds(view(azozo,P)), on("t:0.26").
used("t:0.26",view(azozo,ezuve(z(X))),view(azozo,isa(X,ogoze))) :- holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))), holds(view(azozo,isa(X,ogoze))), fits(c("t:0.26",X),P), holds(view(azozo,P)), on("t:0.26").
used("t:0.26",view(azozo,ezuve(z(X))),view(azozo,P)) :- holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))), holds(view(azozo,isa(X,ogoze))), fits(c("t:0.26",X),P), holds(view(azozo,P)), on("t:0.26").
holds(view(azozo,neg(isa(X,uzeme)))) :- holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))), holds(view(azozo,isa(X,ogoze))), fits(P,o("t:0.26",X)), holds(view(azozo,neg(P))), on("t:0.26").
fired("t:0.26",view(azozo,neg(isa(X,uzeme)))) :- holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))), holds(view(azozo,isa(X,ogoze))), fits(P,o("t:0.26",X)), holds(view(azozo,neg(P))), on("t:0.26").
used("t:0.26",view(azozo,neg(isa(X,uzeme))),view(azozo,if(c("t:0.26",X),o("t:0.26",X)))) :- holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))), holds(view(azozo,isa(X,ogoze))), fits(P,o("t:0.26",X)), holds(view(azozo,neg(P))), on("t:0.26").
used("t:0.26",view(azozo,neg(isa(X,uzeme))),view(azozo,isa(X,ogoze))) :- holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))), holds(view(azozo,isa(X,ogoze))), fits(P,o("t:0.26",X)), holds(view(azozo,neg(P))), on("t:0.26").
used("t:0.26",view(azozo,neg(isa(X,uzeme))),view(azozo,neg(P))) :- holds(view(azozo,if(c("t:0.26",X),o("t:0.26",X)))), holds(view(azozo,isa(X,ogoze))), fits(P,o("t:0.26",X)), holds(view(azozo,neg(P))), on("t:0.26").
% t:0.27
on("t:0.27").
via("t:0.27",clues) :- on("t:0.27").
fired("t:0.27",via("t:0.27",clues)) :- on("t:0.27").
holds(view(azozo,isa(azozo,ogoze))) :- on("t:0.27").
fired("t:0.27",view(azozo,isa(azozo,ogoze))) :- on("t:0.27").
% t:0.28
on("t:0.28").
via("t:0.28",clues) :- on("t:0.28").
fired("t:0.28",via("t:0.28",clues)) :- on("t:0.28").
holds(view(azozo,isa(azozo,uzeme))) :- on("t:0.28").
fired("t:0.28",view(azozo,isa(azozo,uzeme))) :- on("t:0.28").
% t:0.29
on("t:0.29").
via("t:0.29",clues) :- on("t:0.29").
fired("t:0.29",via("t:0.29",clues)) :- on("t:0.29").
holds(view(azozo,neg(ezuve(z(azozo))))) :- on("t:0.29").
fired("t:0.29",view(azozo,neg(ezuve(z(azozo))))) :- on("t:0.29").
% t:0.30
on("t:0.30").
via("t:0.30",clues) :- on("t:0.30").
fired("t:0.30",via("t:0.30",clues)) :- on("t:0.30").
holds(view(azozo,iff(c("t:0.30"),o("t:0.30")))) :- on("t:0.30").
fired("t:0.30",view(azozo,iff(c("t:0.30"),o("t:0.30")))) :- on("t:0.30").
holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))) :- holds(view(azozo,iff(c("t:0.30"),o("t:0.30")))), holds(view(azozo,isa(X,eye))), on("t:0.30").
fired("t:0.30",view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))) :- holds(view(azozo,iff(c("t:0.30"),o("t:0.30")))), holds(view(azozo,isa(X,eye))), on("t:0.30").
used("t:0.30",view(azozo,iff(c("t:0.30",X),o("t:0.30",X))),view(azozo,iff(c("t:0.30"),o("t:0.30")))) :- holds(view(azozo,iff(c("t:0.30"),o("t:0.30")))), holds(view(azozo,isa(X,eye))), on("t:0.30").
used("t:0.30",view(azozo,iff(c("t:0.30",X),o("t:0.30",X))),view(azozo,isa(X,eye))) :- holds(view(azozo,iff(c("t:0.30"),o("t:0.30")))), holds(view(azozo,isa(X,eye))), on("t:0.30").
holds(view(azozo,isa(X,eduyo))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(c("t:0.30",X),P), holds(view(azozo,P)), on("t:0.30").
fired("t:0.30",view(azozo,isa(X,eduyo))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(c("t:0.30",X),P), holds(view(azozo,P)), on("t:0.30").
used("t:0.30",view(azozo,isa(X,eduyo)),view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(c("t:0.30",X),P), holds(view(azozo,P)), on("t:0.30").
used("t:0.30",view(azozo,isa(X,eduyo)),view(azozo,isa(X,eye))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(c("t:0.30",X),P), holds(view(azozo,P)), on("t:0.30").
used("t:0.30",view(azozo,isa(X,eduyo)),view(azozo,P)) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(c("t:0.30",X),P), holds(view(azozo,P)), on("t:0.30").
holds(view(azozo,neg(eduyo(z(X))))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(P,o("t:0.30",X)), holds(view(azozo,neg(P))), on("t:0.30").
fired("t:0.30",view(azozo,neg(eduyo(z(X))))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(P,o("t:0.30",X)), holds(view(azozo,neg(P))), on("t:0.30").
used("t:0.30",view(azozo,neg(eduyo(z(X)))),view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(P,o("t:0.30",X)), holds(view(azozo,neg(P))), on("t:0.30").
used("t:0.30",view(azozo,neg(eduyo(z(X)))),view(azozo,isa(X,eye))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(P,o("t:0.30",X)), holds(view(azozo,neg(P))), on("t:0.30").
used("t:0.30",view(azozo,neg(eduyo(z(X)))),view(azozo,neg(P))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(P,o("t:0.30",X)), holds(view(azozo,neg(P))), on("t:0.30").
holds(view(azozo,neg(isa(X,eduyo)))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(P,c("t:0.30",X)), holds(view(azozo,neg(P))), on("t:0.30").
fired("t:0.30",view(azozo,neg(isa(X,eduyo)))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(P,c("t:0.30",X)), holds(view(azozo,neg(P))), on("t:0.30").
used("t:0.30",view(azozo,neg(isa(X,eduyo))),view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(P,c("t:0.30",X)), holds(view(azozo,neg(P))), on("t:0.30").
used("t:0.30",view(azozo,neg(isa(X,eduyo))),view(azozo,isa(X,eye))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(P,c("t:0.30",X)), holds(view(azozo,neg(P))), on("t:0.30").
used("t:0.30",view(azozo,neg(isa(X,eduyo))),view(azozo,neg(P))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(P,c("t:0.30",X)), holds(view(azozo,neg(P))), on("t:0.30").
holds(view(azozo,eduyo(z(X)))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(o("t:0.30",X),P), holds(view(azozo,P)), on("t:0.30").
fired("t:0.30",view(azozo,eduyo(z(X)))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(o("t:0.30",X),P), holds(view(azozo,P)), on("t:0.30").
used("t:0.30",view(azozo,eduyo(z(X))),view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(o("t:0.30",X),P), holds(view(azozo,P)), on("t:0.30").
used("t:0.30",view(azozo,eduyo(z(X))),view(azozo,isa(X,eye))) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(o("t:0.30",X),P), holds(view(azozo,P)), on("t:0.30").
used("t:0.30",view(azozo,eduyo(z(X))),view(azozo,P)) :- holds(view(azozo,iff(c("t:0.30",X),o("t:0.30",X)))), holds(view(azozo,isa(X,eye))), fits(o("t:0.30",X),P), holds(view(azozo,P)), on("t:0.30").
% t:0.31
on("t:0.31").
via("t:0.31",clues) :- on("t:0.31").
fired("t:0.31",via("t:0.31",clues)) :- on("t:0.31").
holds(view(azozo,isa(azozo,eye))) :- on("t:0.31").
fired("t:0.31",view(azozo,isa(azozo,eye))) :- on("t:0.31").
% t:0.32
on("t:0.32").
via("t:0.32",clues) :- on("t:0.32").
fired("t:0.32",via("t:0.32",clues)) :- on("t:0.32").
holds(view(azozo,eduyo(z(azozo)))) :- on("t:0.32").
fired("t:0.32",view(azozo,eduyo(z(azozo)))) :- on("t:0.32").
% t:0.33
on("t:0.33").
via("t:0.33",clues) :- on("t:0.33").
fired("t:0.33",via("t:0.33",clues)) :- on("t:0.33").
holds(view(azozo,isa(azozo,eduyo))) :- on("t:0.33").
fired("t:0.33",view(azozo,isa(azozo,eduyo))) :- on("t:0.33").

% Fits, from match().
fits(c("t:0.0"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.0")).
fits(o("t:0.0"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.0")).
fits(c("t:0.1"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),c("t:0.1")).
fits(o("t:0.1"),ezuve(z(ahela))).
fits(ezuve(z(ahela)),o("t:0.1")).
fits(c("t:0.3"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.3")).
fits(o("t:0.3"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.3")).
fits(c("t:0.4"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.4")).
fits(o("t:0.4"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.4")).
fits(c("t:0.6"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.6")).
fits(o("t:0.6"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.6")).
fits(c("t:0.8"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),c("t:0.8")).
fits(o("t:0.8"),owuro(z(azozo))).
fits(owuro(z(azozo)),o("t:0.8")).
fits(c("t:0.9"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.9")).
fits(o("t:0.9"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.9")).
fits(c("t:0.10"),owuro(z(odoze))).
fits(owuro(z(odoze)),c("t:0.10")).
fits(c("t:0.10"),owuro(z(nm("t:0.12",z)))).
fits(owuro(z(nm("t:0.12",z))),c("t:0.10")).
fits(o("t:0.10"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.10")).
fits(c("t:0.11"),owuro(z(odoze))).
fits(owuro(z(odoze)),c("t:0.11")).
fits(c("t:0.11"),owuro(z(nm("t:0.12",z)))).
fits(owuro(z(nm("t:0.12",z))),c("t:0.11")).
fits(o("t:0.11"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.11")).
fits(c("t:0.13"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.13")).
fits(o("t:0.13"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.13")).
fits(c("t:0.14"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),c("t:0.14")).
fits(o("t:0.14"),owuro(z(azozo))).
fits(owuro(z(azozo)),o("t:0.14")).
fits(c("t:0.15"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.15")).
fits(o("t:0.15"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.15")).
fits(c("t:0.16"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),c("t:0.16")).
fits(o("t:0.16"),ezuve(z(ahela))).
fits(ezuve(z(ahela)),o("t:0.16")).
fits(c("t:0.17"),isa(nm("t:0.17",bl),ugala)).
fits(isa(nm("t:0.17",bl),ugala),c("t:0.17")).
fits(c("t:0.17"),be(z(nm("t:0.18",z)))).
fits(be(z(nm("t:0.18",z))),c("t:0.17")).
fits(c("t:0.17"),isa(nm("t:0.19",bl),ugala)).
fits(isa(nm("t:0.19",bl),ugala),c("t:0.17")).
fits(c("t:0.17"),isa(nm("t:0.21",bl),ugala)).
fits(isa(nm("t:0.21",bl),ugala),c("t:0.17")).
fits(o("t:0.17"),isa(nm("t:0.17",z),erula)).
fits(isa(nm("t:0.17",z),erula),o("t:0.17")).
fits(o("t:0.17"),isa(nm("t:0.19",z),erula)).
fits(isa(nm("t:0.19",z),erula),o("t:0.17")).
fits(o("t:0.17"),be(z(nm("t:0.20",z)))).
fits(be(z(nm("t:0.20",z))),o("t:0.17")).
fits(o("t:0.17"),isa(nm("t:0.21",z),erula)).
fits(isa(nm("t:0.21",z),erula),o("t:0.17")).
fits(c("t:0.19"),isa(nm("t:0.17",bl),ugala)).
fits(isa(nm("t:0.17",bl),ugala),c("t:0.19")).
fits(c("t:0.19"),be(z(nm("t:0.18",z)))).
fits(be(z(nm("t:0.18",z))),c("t:0.19")).
fits(c("t:0.19"),isa(nm("t:0.19",bl),ugala)).
fits(isa(nm("t:0.19",bl),ugala),c("t:0.19")).
fits(c("t:0.19"),isa(nm("t:0.21",bl),ugala)).
fits(isa(nm("t:0.21",bl),ugala),c("t:0.19")).
fits(o("t:0.19"),isa(nm("t:0.17",z),erula)).
fits(isa(nm("t:0.17",z),erula),o("t:0.19")).
fits(o("t:0.19"),isa(nm("t:0.19",z),erula)).
fits(isa(nm("t:0.19",z),erula),o("t:0.19")).
fits(o("t:0.19"),be(z(nm("t:0.20",z)))).
fits(be(z(nm("t:0.20",z))),o("t:0.19")).
fits(o("t:0.19"),isa(nm("t:0.21",z),erula)).
fits(isa(nm("t:0.21",z),erula),o("t:0.19")).
fits(c("t:0.22"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.22")).
fits(o("t:0.22"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.22")).
fits(c("t:0.23"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.23")).
fits(o("t:0.23"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.23")).
fits(c("t:0.25"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.25")).
fits(o("t:0.25"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.25")).
fits(c("t:0.26",azozo),isa(azozo,uzeme)).
fits(isa(azozo,uzeme),c("t:0.26",azozo)).
fits(o("t:0.26",azozo),ezuve(z(azozo))).
fits(ezuve(z(azozo)),o("t:0.26",azozo)).
fits(c("t:0.30",azozo),eduyo(z(azozo))).
fits(eduyo(z(azozo)),c("t:0.30",azozo)).
fits(o("t:0.30",azozo),isa(azozo,eduyo)).
fits(isa(azozo,eduyo),o("t:0.30",azozo)).
fits(if(c("t:0.0"),o("t:0.0")),iff(c("t:0.4"),o("t:0.4"))).
fits(if(c("t:0.0"),o("t:0.0")),if(c("t:0.6"),o("t:0.6"))).
fits(if(c("t:0.0"),o("t:0.0")),iff(c("t:0.9"),o("t:0.9"))).
fits(if(c("t:0.0"),o("t:0.0")),if(c("t:0.13"),o("t:0.13"))).
fits(if(c("t:0.0"),o("t:0.0")),iff(c("t:0.15"),o("t:0.15"))).
fits(if(c("t:0.0"),o("t:0.0")),if(c("t:0.22"),o("t:0.22"))).
fits(if(c("t:0.0"),o("t:0.0")),if(c("t:0.23"),o("t:0.23"))).
fits(if(c("t:0.0"),o("t:0.0")),if(c("t:0.25"),o("t:0.25"))).
fits(if(c("t:0.1"),o("t:0.1")),if(c("t:0.16"),o("t:0.16"))).
fits(onlyif(c("t:0.3"),o("t:0.3")),iff(c("t:0.4"),o("t:0.4"))).
fits(onlyif(c("t:0.3"),o("t:0.3")),iff(c("t:0.9"),o("t:0.9"))).
fits(onlyif(c("t:0.3"),o("t:0.3")),iff(c("t:0.15"),o("t:0.15"))).
fits(iff(c("t:0.4"),o("t:0.4")),iff(c("t:0.9"),o("t:0.9"))).
fits(iff(c("t:0.4"),o("t:0.4")),iff(c("t:0.15"),o("t:0.15"))).
fits(if(c("t:0.6"),o("t:0.6")),if(c("t:0.0"),o("t:0.0"))).
fits(if(c("t:0.6"),o("t:0.6")),iff(c("t:0.4"),o("t:0.4"))).
fits(if(c("t:0.6"),o("t:0.6")),iff(c("t:0.9"),o("t:0.9"))).
fits(if(c("t:0.6"),o("t:0.6")),if(c("t:0.13"),o("t:0.13"))).
fits(if(c("t:0.6"),o("t:0.6")),iff(c("t:0.15"),o("t:0.15"))).
fits(if(c("t:0.6"),o("t:0.6")),if(c("t:0.22"),o("t:0.22"))).
fits(if(c("t:0.6"),o("t:0.6")),if(c("t:0.23"),o("t:0.23"))).
fits(if(c("t:0.6"),o("t:0.6")),if(c("t:0.25"),o("t:0.25"))).
fits(onlyif(c("t:0.8"),o("t:0.8")),onlyif(c("t:0.14"),o("t:0.14"))).
fits(iff(c("t:0.9"),o("t:0.9")),iff(c("t:0.4"),o("t:0.4"))).
fits(iff(c("t:0.9"),o("t:0.9")),iff(c("t:0.15"),o("t:0.15"))).
fits(if(c("t:0.10"),o("t:0.10")),if(c("t:0.11"),o("t:0.11"))).
fits(if(c("t:0.11"),o("t:0.11")),if(c("t:0.10"),o("t:0.10"))).
fits(if(c("t:0.13"),o("t:0.13")),if(c("t:0.0"),o("t:0.0"))).
fits(if(c("t:0.13"),o("t:0.13")),iff(c("t:0.4"),o("t:0.4"))).
fits(if(c("t:0.13"),o("t:0.13")),if(c("t:0.6"),o("t:0.6"))).
fits(if(c("t:0.13"),o("t:0.13")),iff(c("t:0.9"),o("t:0.9"))).
fits(if(c("t:0.13"),o("t:0.13")),iff(c("t:0.15"),o("t:0.15"))).
fits(if(c("t:0.13"),o("t:0.13")),if(c("t:0.22"),o("t:0.22"))).
fits(if(c("t:0.13"),o("t:0.13")),if(c("t:0.23"),o("t:0.23"))).
fits(if(c("t:0.13"),o("t:0.13")),if(c("t:0.25"),o("t:0.25"))).
fits(onlyif(c("t:0.14"),o("t:0.14")),onlyif(c("t:0.8"),o("t:0.8"))).
fits(iff(c("t:0.15"),o("t:0.15")),iff(c("t:0.4"),o("t:0.4"))).
fits(iff(c("t:0.15"),o("t:0.15")),iff(c("t:0.9"),o("t:0.9"))).
fits(if(c("t:0.16"),o("t:0.16")),if(c("t:0.1"),o("t:0.1"))).
fits(if(c("t:0.22"),o("t:0.22")),if(c("t:0.0"),o("t:0.0"))).
fits(if(c("t:0.22"),o("t:0.22")),iff(c("t:0.4"),o("t:0.4"))).
fits(if(c("t:0.22"),o("t:0.22")),if(c("t:0.6"),o("t:0.6"))).
fits(if(c("t:0.22"),o("t:0.22")),iff(c("t:0.9"),o("t:0.9"))).
fits(if(c("t:0.22"),o("t:0.22")),if(c("t:0.13"),o("t:0.13"))).
fits(if(c("t:0.22"),o("t:0.22")),iff(c("t:0.15"),o("t:0.15"))).
fits(if(c("t:0.22"),o("t:0.22")),if(c("t:0.23"),o("t:0.23"))).
fits(if(c("t:0.22"),o("t:0.22")),if(c("t:0.25"),o("t:0.25"))).
fits(if(c("t:0.23"),o("t:0.23")),if(c("t:0.0"),o("t:0.0"))).
fits(if(c("t:0.23"),o("t:0.23")),iff(c("t:0.4"),o("t:0.4"))).
fits(if(c("t:0.23"),o("t:0.23")),if(c("t:0.6"),o("t:0.6"))).
fits(if(c("t:0.23"),o("t:0.23")),iff(c("t:0.9"),o("t:0.9"))).
fits(if(c("t:0.23"),o("t:0.23")),if(c("t:0.13"),o("t:0.13"))).
fits(if(c("t:0.23"),o("t:0.23")),iff(c("t:0.15"),o("t:0.15"))).
fits(if(c("t:0.23"),o("t:0.23")),if(c("t:0.22"),o("t:0.22"))).
fits(if(c("t:0.23"),o("t:0.23")),if(c("t:0.25"),o("t:0.25"))).
fits(if(c("t:0.25"),o("t:0.25")),if(c("t:0.0"),o("t:0.0"))).
fits(if(c("t:0.25"),o("t:0.25")),iff(c("t:0.4"),o("t:0.4"))).
fits(if(c("t:0.25"),o("t:0.25")),if(c("t:0.6"),o("t:0.6"))).
fits(if(c("t:0.25"),o("t:0.25")),iff(c("t:0.9"),o("t:0.9"))).
fits(if(c("t:0.25"),o("t:0.25")),if(c("t:0.13"),o("t:0.13"))).
fits(if(c("t:0.25"),o("t:0.25")),iff(c("t:0.15"),o("t:0.15"))).
fits(if(c("t:0.25"),o("t:0.25")),if(c("t:0.22"),o("t:0.22"))).
fits(if(c("t:0.25"),o("t:0.25")),if(c("t:0.23"),o("t:0.23"))).
