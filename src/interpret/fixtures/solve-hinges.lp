% t:0.0 = h1
% t:0.1 = h2
% t:0.2 = h3
% t:0.3 = h1o
% t:0.4 = h1i
% t:0.5 = h4

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).
% A holder's view (R2-1 row 1, R2-2): one holder's views clash; two holders' never do, nor a view and your claim.
clash(view(H, P)) :- holds(view(H, P)), holds(view(H, neg(P))).
clash(view(H, Q)) :- holds(view(H, neg(Q))), holds(view(H, P)), fits(Q, P).
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
holds(ehohe(z(alazu))) :- fits(c("t:0.0"),P), holds(P), on("t:0.0").
fired("t:0.0",ehohe(z(alazu))) :- fits(c("t:0.0"),P), holds(P), on("t:0.0").
used("t:0.0",ehohe(z(alazu)),P) :- fits(c("t:0.0"),P), holds(P), on("t:0.0").
holds(neg(owuro(z(azozo)))) :- fits(P,o("t:0.0")), holds(neg(P)), on("t:0.0").
fired("t:0.0",neg(owuro(z(azozo)))) :- fits(P,o("t:0.0")), holds(neg(P)), on("t:0.0").
used("t:0.0",neg(owuro(z(azozo))),neg(P)) :- fits(P,o("t:0.0")), holds(neg(P)), on("t:0.0").
% t:0.1
on("t:0.1").
holds(ezuve(z(ahela))) :- fits(c("t:0.1"),P), holds(P), on("t:0.1").
fired("t:0.1",ezuve(z(ahela))) :- fits(c("t:0.1"),P), holds(P), on("t:0.1").
used("t:0.1",ezuve(z(ahela)),P) :- fits(c("t:0.1"),P), holds(P), on("t:0.1").
holds(neg(ehohe(z(alazu)))) :- fits(P,o("t:0.1")), holds(neg(P)), on("t:0.1").
fired("t:0.1",neg(ehohe(z(alazu)))) :- fits(P,o("t:0.1")), holds(neg(P)), on("t:0.1").
used("t:0.1",neg(ehohe(z(alazu))),neg(P)) :- fits(P,o("t:0.1")), holds(neg(P)), on("t:0.1").
% t:0.2
on("t:0.2").
holds(owuro(z(azozo))) :- on("t:0.2").
fired("t:0.2",owuro(z(azozo))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(neg(ehohe(z(alazu)))) :- fits(P,c("t:0.3")), holds(neg(P)), on("t:0.3").
fired("t:0.3",neg(ehohe(z(alazu)))) :- fits(P,c("t:0.3")), holds(neg(P)), on("t:0.3").
used("t:0.3",neg(ehohe(z(alazu))),neg(P)) :- fits(P,c("t:0.3")), holds(neg(P)), on("t:0.3").
holds(owuro(z(azozo))) :- fits(o("t:0.3"),P), holds(P), on("t:0.3").
fired("t:0.3",owuro(z(azozo))) :- fits(o("t:0.3"),P), holds(P), on("t:0.3").
used("t:0.3",owuro(z(azozo)),P) :- fits(o("t:0.3"),P), holds(P), on("t:0.3").
% t:0.4
on("t:0.4").
holds(ehohe(z(alazu))) :- fits(c("t:0.4"),P), holds(P), on("t:0.4").
fired("t:0.4",ehohe(z(alazu))) :- fits(c("t:0.4"),P), holds(P), on("t:0.4").
used("t:0.4",ehohe(z(alazu)),P) :- fits(c("t:0.4"),P), holds(P), on("t:0.4").
holds(neg(owuro(z(azozo)))) :- fits(P,o("t:0.4")), holds(neg(P)), on("t:0.4").
fired("t:0.4",neg(owuro(z(azozo)))) :- fits(P,o("t:0.4")), holds(neg(P)), on("t:0.4").
used("t:0.4",neg(owuro(z(azozo))),neg(P)) :- fits(P,o("t:0.4")), holds(neg(P)), on("t:0.4").
holds(neg(ehohe(z(alazu)))) :- fits(P,c("t:0.4")), holds(neg(P)), on("t:0.4").
fired("t:0.4",neg(ehohe(z(alazu)))) :- fits(P,c("t:0.4")), holds(neg(P)), on("t:0.4").
used("t:0.4",neg(ehohe(z(alazu))),neg(P)) :- fits(P,c("t:0.4")), holds(neg(P)), on("t:0.4").
holds(owuro(z(azozo))) :- fits(o("t:0.4"),P), holds(P), on("t:0.4").
fired("t:0.4",owuro(z(azozo))) :- fits(o("t:0.4"),P), holds(P), on("t:0.4").
used("t:0.4",owuro(z(azozo)),P) :- fits(o("t:0.4"),P), holds(P), on("t:0.4").
% t:0.5
on("t:0.5").
holds(neg(owuro(z(azozo)))) :- on("t:0.5").
fired("t:0.5",neg(owuro(z(azozo)))) :- on("t:0.5").

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
