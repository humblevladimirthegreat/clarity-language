% t:0.0 = b1
% t:0.1 = b2
% t:0.2 = b3
% t:0.3 = b4
% t:0.4 = b5
% t:0.5 = b7
% t:0.6 = b8
% t:0.7 = b9
% t:0.8 = b10
% t:0.9 = b11
% t:0.10 = undefined

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
via("t:0.0",clues) :- on("t:0.0").
fired("t:0.0",via("t:0.0",clues)) :- on("t:0.0").
holds(view(azozo,uduru(z(alazu)))) :- on("t:0.0").
fired("t:0.0",view(azozo,uduru(z(alazu)))) :- on("t:0.0").
% t:0.1
on("t:0.1").
via("t:0.1",reported) :- on("t:0.1").
fired("t:0.1",via("t:0.1",reported)) :- on("t:0.1").
holds(view(azozo,neg(uduru(z(alazu))))) :- on("t:0.1").
fired("t:0.1",view(azozo,neg(uduru(z(alazu))))) :- on("t:0.1").
% t:0.2
on("t:0.2").
via("t:0.2",clues) :- on("t:0.2").
fired("t:0.2",via("t:0.2",clues)) :- on("t:0.2").
holds(view(ahela,neg(uduru(z(alazu))))) :- on("t:0.2").
fired("t:0.2",view(ahela,neg(uduru(z(alazu))))) :- on("t:0.2").
% t:0.3
on("t:0.3").
via("t:0.3",clues) :- on("t:0.3").
fired("t:0.3",via("t:0.3",clues)) :- on("t:0.3").
holds(view(ahela,neg(uduru(z(alazu))))) :- on("t:0.3").
fired("t:0.3",view(ahela,neg(uduru(z(alazu))))) :- on("t:0.3").
% t:0.4
on("t:0.4").
via("t:0.4",clues) :- on("t:0.4").
fired("t:0.4",via("t:0.4",clues)) :- on("t:0.4").
holds(view(azozo,uduru(z(alazu)))) :- on("t:0.4").
fired("t:0.4",view(azozo,uduru(z(alazu)))) :- on("t:0.4").
% t:0.5
on("t:0.5").
via("t:0.5",clues) :- on("t:0.5").
fired("t:0.5",via("t:0.5",clues)) :- on("t:0.5").
holds(view(azozo,ezuve(z(alazu)))) :- on("t:0.5").
fired("t:0.5",view(azozo,ezuve(z(alazu)))) :- on("t:0.5").
% t:0.6
on("t:0.6").
via("t:0.6",clues) :- on("t:0.6").
fired("t:0.6",via("t:0.6",clues)) :- on("t:0.6").
holds(view(interlocutors,uduru(z(alazu)))) :- on("t:0.6").
fired("t:0.6",view(interlocutors,uduru(z(alazu)))) :- on("t:0.6").
% t:0.7
on("t:0.7").
holds(isa(nm("t:0.7",h),eye)) :- on("t:0.7").
fired("t:0.7",isa(nm("t:0.7",h),eye)) :- on("t:0.7").
via("t:0.7",clues) :- on("t:0.7").
fired("t:0.7",via("t:0.7",clues)) :- on("t:0.7").
holds(view(nm("t:0.7",h),uduru(z(alazu)))) :- on("t:0.7").
fired("t:0.7",view(nm("t:0.7",h),uduru(z(alazu)))) :- on("t:0.7").
% t:0.8
on("t:0.8").
holds(isa(nm("t:0.8",h),eye)) :- on("t:0.8").
fired("t:0.8",isa(nm("t:0.8",h),eye)) :- on("t:0.8").
via("t:0.8",clues) :- on("t:0.8").
fired("t:0.8",via("t:0.8",clues)) :- on("t:0.8").
holds(view(nm("t:0.8",h),neg(uduru(z(alazu))))) :- on("t:0.8").
fired("t:0.8",view(nm("t:0.8",h),neg(uduru(z(alazu))))) :- on("t:0.8").
% t:0.9
on("t:0.9").
via("t:0.9",clues) :- on("t:0.9").
fired("t:0.9",via("t:0.9",clues)) :- on("t:0.9").
holds(view(azozo,if(c("t:0.9"),o("t:0.9")))) :- on("t:0.9").
fired("t:0.9",view(azozo,if(c("t:0.9"),o("t:0.9")))) :- on("t:0.9").
holds(view(azozo,uduru(z(alazu)))) :- holds(view(azozo,if(c("t:0.9"),o("t:0.9")))), fits(c("t:0.9"),P), holds(view(azozo,P)), on("t:0.9").
fired("t:0.9",view(azozo,uduru(z(alazu)))) :- holds(view(azozo,if(c("t:0.9"),o("t:0.9")))), fits(c("t:0.9"),P), holds(view(azozo,P)), on("t:0.9").
used("t:0.9",view(azozo,uduru(z(alazu))),view(azozo,if(c("t:0.9"),o("t:0.9")))) :- holds(view(azozo,if(c("t:0.9"),o("t:0.9")))), fits(c("t:0.9"),P), holds(view(azozo,P)), on("t:0.9").
used("t:0.9",view(azozo,uduru(z(alazu))),view(azozo,P)) :- holds(view(azozo,if(c("t:0.9"),o("t:0.9")))), fits(c("t:0.9"),P), holds(view(azozo,P)), on("t:0.9").
holds(view(azozo,neg(owuro(z(azozo))))) :- holds(view(azozo,if(c("t:0.9"),o("t:0.9")))), fits(P,o("t:0.9")), holds(view(azozo,neg(P))), on("t:0.9").
fired("t:0.9",view(azozo,neg(owuro(z(azozo))))) :- holds(view(azozo,if(c("t:0.9"),o("t:0.9")))), fits(P,o("t:0.9")), holds(view(azozo,neg(P))), on("t:0.9").
used("t:0.9",view(azozo,neg(owuro(z(azozo)))),view(azozo,if(c("t:0.9"),o("t:0.9")))) :- holds(view(azozo,if(c("t:0.9"),o("t:0.9")))), fits(P,o("t:0.9")), holds(view(azozo,neg(P))), on("t:0.9").
used("t:0.9",view(azozo,neg(owuro(z(azozo)))),view(azozo,neg(P))) :- holds(view(azozo,if(c("t:0.9"),o("t:0.9")))), fits(P,o("t:0.9")), holds(view(azozo,neg(P))), on("t:0.9").
% t:0.10
on("t:0.10").
via("t:0.10",clues) :- on("t:0.10").
fired("t:0.10",via("t:0.10",clues)) :- on("t:0.10").
holds(view(azozo,owuro(z(azozo)))) :- on("t:0.10").
fired("t:0.10",view(azozo,owuro(z(azozo)))) :- on("t:0.10").

% Fits, from match().
fits(c("t:0.9"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.9")).
fits(o("t:0.9"),uduru(z(alazu))).
fits(uduru(z(alazu)),o("t:0.9")).
