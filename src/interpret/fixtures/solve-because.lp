% t:0.0 = c1
% t:0.1 = c2
% t:0.2 = c3
% t:0.3 = c4
% t:0.4 = c5
% t:0.5 = c6
% t:0.6 = c7
% t:0.7 = c8
% t:0.8 = c9
% t:0.9 = c10
% t:0.10 = c12
% t:0.11 = c13

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
holds(owuro(z(azozo))) :- on("t:0.0").
fired("t:0.0",owuro(z(azozo))) :- on("t:0.0").
holds(ezuve(z(alazu))) :- on("t:0.0").
fired("t:0.0",ezuve(z(alazu))) :- on("t:0.0").
holds(cause(ezuve(z(alazu)),owuro(z(azozo)))) :- on("t:0.0").
fired("t:0.0",cause(ezuve(z(alazu)),owuro(z(azozo)))) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(neg(ezuve(z(alazu)))) :- on("t:0.1").
fired("t:0.1",neg(ezuve(z(alazu)))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(owuro(z(azozo))) :- on("t:0.2").
fired("t:0.2",owuro(z(azozo))) :- on("t:0.2").
holds(neg(cause(ezuve(z(alazu)),owuro(z(azozo))))) :- on("t:0.2").
fired("t:0.2",neg(cause(ezuve(z(alazu)),owuro(z(azozo))))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(neg(owuro(z(azozo)))) :- on("t:0.3").
fired("t:0.3",neg(owuro(z(azozo)))) :- on("t:0.3").
% t:0.4
on("t:0.4").
holds(uduru(z(azozo))) :- on("t:0.4").
fired("t:0.4",uduru(z(azozo))) :- on("t:0.4").
holds(ezuyo(z(alazu))) :- on("t:0.4").
fired("t:0.4",ezuyo(z(alazu))) :- on("t:0.4").
holds(cause(ezuyo(z(alazu)),uduru(z(azozo)))) :- on("t:0.4").
fired("t:0.4",cause(ezuyo(z(alazu)),uduru(z(azozo)))) :- on("t:0.4").
holds(fault(ezuyo(z(alazu)),uduru(z(azozo)))) :- on("t:0.4").
fired("t:0.4",fault(ezuyo(z(alazu)),uduru(z(azozo)))) :- on("t:0.4").
% t:0.5
on("t:0.5").
holds(uduru(z(azozo))) :- on("t:0.5").
fired("t:0.5",uduru(z(azozo))) :- on("t:0.5").
holds(ezuyo(z(alazu))) :- on("t:0.5").
fired("t:0.5",ezuyo(z(alazu))) :- on("t:0.5").
holds(cause(ezuyo(z(alazu)),uduru(z(azozo)))) :- on("t:0.5").
fired("t:0.5",cause(ezuyo(z(alazu)),uduru(z(azozo)))) :- on("t:0.5").
holds(share(ezuyo(z(alazu)),uduru(z(azozo)))) :- on("t:0.5").
fired("t:0.5",share(ezuyo(z(alazu)),uduru(z(azozo)))) :- on("t:0.5").
% t:0.6
on("t:0.6").
holds(uduru(z(azozo))) :- on("t:0.6").
fired("t:0.6",uduru(z(azozo))) :- on("t:0.6").
holds(ezuyo(z(alazu))) :- on("t:0.6").
fired("t:0.6",ezuyo(z(alazu))) :- on("t:0.6").
holds(cause(ezuyo(z(alazu)),uduru(z(azozo)))) :- on("t:0.6").
fired("t:0.6",cause(ezuyo(z(alazu)),uduru(z(azozo)))) :- on("t:0.6").
% t:0.7
on("t:0.7").
holds(owuro(z(azozo))) :- on("t:0.7").
fired("t:0.7",owuro(z(azozo))) :- on("t:0.7").
holds(ezuve(z(alazu))) :- on("t:0.7").
fired("t:0.7",ezuve(z(alazu))) :- on("t:0.7").
holds(cause(ezuve(z(alazu)),owuro(z(azozo)))) :- on("t:0.7").
fired("t:0.7",cause(ezuve(z(alazu)),owuro(z(azozo)))) :- on("t:0.7").
holds(neg(owuro(z(azozo)))) :- fits(P,c("t:0.7")), holds(neg(P)), on("t:0.7").
fired("t:0.7",neg(owuro(z(azozo)))) :- fits(P,c("t:0.7")), holds(neg(P)), on("t:0.7").
used("t:0.7",neg(owuro(z(azozo))),neg(P)) :- fits(P,c("t:0.7")), holds(neg(P)), on("t:0.7").
holds(ezuve(z(alazu))) :- fits(o("t:0.7"),P), holds(P), on("t:0.7").
fired("t:0.7",ezuve(z(alazu))) :- fits(o("t:0.7"),P), holds(P), on("t:0.7").
used("t:0.7",ezuve(z(alazu)),P) :- fits(o("t:0.7"),P), holds(P), on("t:0.7").
% t:0.8
on("t:0.8").
holds(owuro(z(azozo))) :- on("t:0.8").
fired("t:0.8",owuro(z(azozo))) :- on("t:0.8").
holds(against(owuro(z(azozo)),plan(sp("a")))) :- on("t:0.8").
fired("t:0.8",against(owuro(z(azozo)),plan(sp("a")))) :- on("t:0.8").
% t:0.9
on("t:0.9").
holds(owuro(z(azozo))) :- on("t:0.9").
fired("t:0.9",owuro(z(azozo))) :- on("t:0.9").
holds(against(owuro(z(azozo)),say(rules,v,u,u,l))) :- on("t:0.9").
fired("t:0.9",against(owuro(z(azozo)),say(rules,v,u,u,l))) :- on("t:0.9").
holds(say(rules,v,u,u,l,owuro(z(azozo)))) :- on("t:0.9").
fired("t:0.9",say(rules,v,u,u,l,owuro(z(azozo)))) :- on("t:0.9").
% t:0.10
on("t:0.10").
holds(say(rules,v,u,a,l,owuro(z(azozo)))) :- on("t:0.10").
fired("t:0.10",say(rules,v,u,a,l,owuro(z(azozo)))) :- on("t:0.10").
% t:0.11
on("t:0.11").
holds(ehohe(z(ahela))) :- on("t:0.11").
fired("t:0.11",ehohe(z(ahela))) :- on("t:0.11").

% Fits, from match().
fits(c("t:0.7"),ezuve(z(alazu))).
fits(ezuve(z(alazu)),c("t:0.7")).
fits(o("t:0.7"),owuro(z(azozo))).
fits(owuro(z(azozo)),o("t:0.7")).
