% t:0.0 = k17
% t:0.1 = k18
% t:0.2 = k19
% t:0.3 = b1
% t:0.4 = b2
% t:0.5 = b3
% t:0.6 = b4
% t:0.7 = b5
% t:0.8 = b5
% t:0.9 = b7
% t:0.10 = b8
% t:0.11 = b9
% t:0.12 = b10
% t:0.13 = b11
% t:0.14 = k1
% t:0.15 = k2
% t:0.16 = k3
% t:0.17 = k4
% t:0.18 = k4
% t:0.19 = k6
% t:0.20 = k7
% t:0.21 = k8
% t:0.22 = k9
% t:0.23 = k10
% t:0.24 = k11
% t:0.25 = k12
% t:0.26 = k13
% t:0.27 = k51
% t:0.28 = k52
% t:0.29 = k39
% t:0.30 = k15
% t:1.0 = k16
% t:2.0 = k16
% t:3.0 = k21
% t:4.0 = k21
% t:4.1 = k22
% t:4.2 = k23
% t:4.3 = k24
% t:4.4 = k25
% t:4.5 = k26
% t:4.6 = k27
% t:4.7 = k28
% t:5.0 = k29
% t:6.0 = k29
% t:7.0 = k30
% t:8.0 = k30
% t:8.1 = k31
% t:8.2 = k32
% t:8.3 = k33
% t:8.4 = k34
% t:8.5 = k35
% t:8.6 = k36
% t:8.7 = k14

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

% Say words inside a holder's view (R4a-13).
clash(view(V, say(W, P, R, u, E, T))) :- holds(view(V, say(W, P, R, a, E, T))), holds(view(V, say(W, P, R, u, E, T))).
clash(view(V, say(W, P, R, u, E, T))) :- holds(view(V, say(W, P, R, o, E, T))), holds(view(V, say(W, P, R, u, E, T))).
clash(view(V, say(W, P, R, u, E, Q))) :- holds(view(V, say(W, P, R, a, E, T))), holds(view(V, say(W, P, R, u, E, Q))), fits(Q, T).
clash(view(V, say(W, P, R, u, E, Q))) :- holds(view(V, say(W, P, R, o, E, T))), holds(view(V, say(W, P, R, u, E, Q))), fits(Q, T).
clash(view(V, say(W, P, R, u, E, T, X))) :- holds(view(V, say(W, P, R, a, E, T, X))), holds(view(V, say(W, P, R, u, E, T, X))).
clash(view(V, say(W, P, R, u, E, T, X))) :- holds(view(V, say(W, P, R, o, E, T, X))), holds(view(V, say(W, P, R, u, E, T, X))).
clash(view(V, say(W, P, R, u, E, Q, X))) :- holds(view(V, say(W, P, R, a, E, T, X))), holds(view(V, say(W, P, R, u, E, Q, X))), fits(Q, T).
clash(view(V, say(W, P, R, u, E, Q, X))) :- holds(view(V, say(W, P, R, o, E, T, X))), holds(view(V, say(W, P, R, u, E, Q, X))), fits(Q, T).
holds(view(V, say(W, P, R, a, E, T))) :- holds(view(V, say(W, P, R, o, E, T))).
fired(requires, view(V, say(W, P, R, a, E, T))) :- holds(view(V, say(W, P, R, o, E, T))).
used(requires, view(V, say(W, P, R, a, E, T)), view(V, say(W, P, R, o, E, T))) :- holds(view(V, say(W, P, R, o, E, T))).
holds(view(V, say(W, P, R, a, E, T, X))) :- holds(view(V, say(W, P, R, o, E, T, X))).
fired(requires, view(V, say(W, P, R, a, E, T, X))) :- holds(view(V, say(W, P, R, o, E, T, X))).
used(requires, view(V, say(W, P, R, a, E, T, X)), view(V, say(W, P, R, o, E, T, X))) :- holds(view(V, say(W, P, R, o, E, T, X))).
holds(view(V, neg(say(W, P, R, a, E, T)))) :- holds(view(V, say(W, P, R, u, E, T))).
fired(bans, view(V, neg(say(W, P, R, a, E, T)))) :- holds(view(V, say(W, P, R, u, E, T))).
used(bans, view(V, neg(say(W, P, R, a, E, T))), view(V, say(W, P, R, u, E, T))) :- holds(view(V, say(W, P, R, u, E, T))).
holds(view(V, neg(say(W, P, R, a, E, Q)))) :- holds(view(V, say(W, P, R, u, E, T))), fits(T, Q).
fired(bans, view(V, neg(say(W, P, R, a, E, Q)))) :- holds(view(V, say(W, P, R, u, E, T))), fits(T, Q).
used(bans, view(V, neg(say(W, P, R, a, E, Q))), view(V, say(W, P, R, u, E, T))) :- holds(view(V, say(W, P, R, u, E, T))), fits(T, Q).
holds(view(V, neg(say(W, P, R, a, E, T, X)))) :- holds(view(V, say(W, P, R, u, E, T, X))).
fired(bans, view(V, neg(say(W, P, R, a, E, T, X)))) :- holds(view(V, say(W, P, R, u, E, T, X))).
used(bans, view(V, neg(say(W, P, R, a, E, T, X))), view(V, say(W, P, R, u, E, T, X))) :- holds(view(V, say(W, P, R, u, E, T, X))).
holds(view(V, neg(say(W, P, R, a, E, Q, X)))) :- holds(view(V, say(W, P, R, u, E, T, X))), fits(T, Q).
fired(bans, view(V, neg(say(W, P, R, a, E, Q, X)))) :- holds(view(V, say(W, P, R, u, E, T, X))), fits(T, Q).
used(bans, view(V, neg(say(W, P, R, a, E, Q, X))), view(V, say(W, P, R, u, E, T, X))) :- holds(view(V, say(W, P, R, u, E, T, X))), fits(T, Q).

% t:0.0
on("t:0.0").
holds(owuro(z(azozo))) :- on("t:0.0").
fired("t:0.0",owuro(z(azozo))) :- on("t:0.0").
holds(against(owuro(z(azozo)),plan(alazu))) :- on("t:0.0").
fired("t:0.0",against(owuro(z(azozo)),plan(alazu))) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(owuro(z(azozo))) :- on("t:0.1").
fired("t:0.1",owuro(z(azozo))) :- on("t:0.1").
holds(against(owuro(z(azozo)),channel(reported,alazu))) :- on("t:0.1").
fired("t:0.1",against(owuro(z(azozo)),channel(reported,alazu))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(owuro(z(azozo))) :- on("t:0.2").
fired("t:0.2",owuro(z(azozo))) :- on("t:0.2").
holds(against(owuro(z(azozo)),channel(reported,sp("a")))) :- on("t:0.2").
fired("t:0.2",against(owuro(z(azozo)),channel(reported,sp("a")))) :- on("t:0.2").
% t:0.3
on("t:0.3").
via("t:0.3",clues) :- on("t:0.3").
fired("t:0.3",via("t:0.3",clues)) :- on("t:0.3").
holds(view(azozo,uduru(z(alazu)))) :- on("t:0.3").
fired("t:0.3",view(azozo,uduru(z(alazu)))) :- on("t:0.3").
% t:0.4
on("t:0.4").
via("t:0.4",reported) :- on("t:0.4").
fired("t:0.4",via("t:0.4",reported)) :- on("t:0.4").
holds(view(azozo,neg(uduru(z(alazu))))) :- on("t:0.4").
fired("t:0.4",view(azozo,neg(uduru(z(alazu))))) :- on("t:0.4").
% t:0.5
on("t:0.5").
via("t:0.5",clues) :- on("t:0.5").
fired("t:0.5",via("t:0.5",clues)) :- on("t:0.5").
holds(view(ahela,neg(uduru(z(alazu))))) :- on("t:0.5").
fired("t:0.5",view(ahela,neg(uduru(z(alazu))))) :- on("t:0.5").
% t:0.6
on("t:0.6").
via("t:0.6",clues) :- on("t:0.6").
fired("t:0.6",via("t:0.6",clues)) :- on("t:0.6").
holds(view(ahela,neg(uduru(z(alazu))))) :- on("t:0.6").
fired("t:0.6",view(ahela,neg(uduru(z(alazu))))) :- on("t:0.6").
% t:0.7
on("t:0.7").
via("t:0.7",clues) :- on("t:0.7").
fired("t:0.7",via("t:0.7",clues)) :- on("t:0.7").
holds(view(azozo,uduru(z(alazu)))) :- on("t:0.7").
fired("t:0.7",view(azozo,uduru(z(alazu)))) :- on("t:0.7").
% t:0.8
on("t:0.8").
via("t:0.8",clues) :- on("t:0.8").
fired("t:0.8",via("t:0.8",clues)) :- on("t:0.8").
holds(view(azozo,ezuve(z(alazu)))) :- on("t:0.8").
fired("t:0.8",view(azozo,ezuve(z(alazu)))) :- on("t:0.8").
% t:0.9
on("t:0.9").
via("t:0.9",clues) :- on("t:0.9").
fired("t:0.9",via("t:0.9",clues)) :- on("t:0.9").
holds(view(we(8),uduru(z(alazu)))) :- on("t:0.9").
fired("t:0.9",view(we(8),uduru(z(alazu)))) :- on("t:0.9").
% t:0.10
on("t:0.10").
holds(isa(nm("t:0.10",h),eye)) :- on("t:0.10").
fired("t:0.10",isa(nm("t:0.10",h),eye)) :- on("t:0.10").
via("t:0.10",clues) :- on("t:0.10").
fired("t:0.10",via("t:0.10",clues)) :- on("t:0.10").
holds(view(nm("t:0.10",h),uduru(z(alazu)))) :- on("t:0.10").
fired("t:0.10",view(nm("t:0.10",h),uduru(z(alazu)))) :- on("t:0.10").
% t:0.11
on("t:0.11").
holds(isa(nm("t:0.11",h),eye)) :- on("t:0.11").
fired("t:0.11",isa(nm("t:0.11",h),eye)) :- on("t:0.11").
via("t:0.11",clues) :- on("t:0.11").
fired("t:0.11",via("t:0.11",clues)) :- on("t:0.11").
holds(view(nm("t:0.11",h),neg(uduru(z(alazu))))) :- on("t:0.11").
fired("t:0.11",view(nm("t:0.11",h),neg(uduru(z(alazu))))) :- on("t:0.11").
% t:0.12
on("t:0.12").
via("t:0.12",clues) :- on("t:0.12").
fired("t:0.12",via("t:0.12",clues)) :- on("t:0.12").
holds(view(azozo,if(c("t:0.12"),o("t:0.12")))) :- on("t:0.12").
fired("t:0.12",view(azozo,if(c("t:0.12"),o("t:0.12")))) :- on("t:0.12").
holds(view(azozo,uduru(z(alazu)))) :- holds(view(azozo,if(c("t:0.12"),o("t:0.12")))), fits(c("t:0.12"),P), holds(view(azozo,P)), on("t:0.12").
fired("t:0.12",view(azozo,uduru(z(alazu)))) :- holds(view(azozo,if(c("t:0.12"),o("t:0.12")))), fits(c("t:0.12"),P), holds(view(azozo,P)), on("t:0.12").
used("t:0.12",view(azozo,uduru(z(alazu))),view(azozo,if(c("t:0.12"),o("t:0.12")))) :- holds(view(azozo,if(c("t:0.12"),o("t:0.12")))), fits(c("t:0.12"),P), holds(view(azozo,P)), on("t:0.12").
used("t:0.12",view(azozo,uduru(z(alazu))),view(azozo,P)) :- holds(view(azozo,if(c("t:0.12"),o("t:0.12")))), fits(c("t:0.12"),P), holds(view(azozo,P)), on("t:0.12").
holds(view(azozo,neg(owuro(z(azozo))))) :- holds(view(azozo,if(c("t:0.12"),o("t:0.12")))), fits(P,o("t:0.12")), holds(view(azozo,neg(P))), on("t:0.12").
fired("t:0.12",view(azozo,neg(owuro(z(azozo))))) :- holds(view(azozo,if(c("t:0.12"),o("t:0.12")))), fits(P,o("t:0.12")), holds(view(azozo,neg(P))), on("t:0.12").
used("t:0.12",view(azozo,neg(owuro(z(azozo)))),view(azozo,if(c("t:0.12"),o("t:0.12")))) :- holds(view(azozo,if(c("t:0.12"),o("t:0.12")))), fits(P,o("t:0.12")), holds(view(azozo,neg(P))), on("t:0.12").
used("t:0.12",view(azozo,neg(owuro(z(azozo)))),view(azozo,neg(P))) :- holds(view(azozo,if(c("t:0.12"),o("t:0.12")))), fits(P,o("t:0.12")), holds(view(azozo,neg(P))), on("t:0.12").
% t:0.13
on("t:0.13").
via("t:0.13",clues) :- on("t:0.13").
fired("t:0.13",via("t:0.13",clues)) :- on("t:0.13").
holds(view(azozo,owuro(z(azozo)))) :- on("t:0.13").
fired("t:0.13",view(azozo,owuro(z(azozo)))) :- on("t:0.13").
% t:0.14
on("t:0.14").
via("t:0.14",clues) :- on("t:0.14").
fired("t:0.14",via("t:0.14",clues)) :- on("t:0.14").
holds(view(azozo,ozuye(z(alazu)))) :- on("t:0.14").
fired("t:0.14",view(azozo,ozuye(z(alazu)))) :- on("t:0.14").
always(view(azozo,ozuye(z(alazu)))) :- on("t:0.14").
fired("t:0.14",always(view(azozo,ozuye(z(alazu))))) :- on("t:0.14").
% t:0.15
on("t:0.15").
via("t:0.15",clues) :- on("t:0.15").
fired("t:0.15",via("t:0.15",clues)) :- on("t:0.15").
holds(view(azozo,neg(ozuye(z(alazu))))) :- on("t:0.15").
fired("t:0.15",view(azozo,neg(ozuye(z(alazu))))) :- on("t:0.15").
never(view(azozo,ozuye(z(alazu)))) :- on("t:0.15").
fired("t:0.15",never(view(azozo,ozuye(z(alazu))))) :- on("t:0.15").
% t:0.16
on("t:0.16").
via("t:0.16",clues) :- on("t:0.16").
fired("t:0.16",via("t:0.16",clues)) :- on("t:0.16").
holds(view(ahela,neg(ozuye(z(alazu))))) :- on("t:0.16").
fired("t:0.16",view(ahela,neg(ozuye(z(alazu))))) :- on("t:0.16").
never(view(ahela,ozuye(z(alazu)))) :- on("t:0.16").
fired("t:0.16",never(view(ahela,ozuye(z(alazu))))) :- on("t:0.16").
% t:0.17
on("t:0.17").
via("t:0.17",memory) :- on("t:0.17").
fired("t:0.17",via("t:0.17",memory)) :- on("t:0.17").
holds(view(we(16),neg(eba(z(listener(16)))))) :- on("t:0.17").
fired("t:0.17",view(we(16),neg(eba(z(listener(16)))))) :- on("t:0.17").
never(view(we(16),eba(z(listener(16))))) :- on("t:0.17").
fired("t:0.17",never(view(we(16),eba(z(listener(16)))))) :- on("t:0.17").
% t:0.18
on("t:0.18").
via("t:0.18",memory) :- on("t:0.18").
fired("t:0.18",via("t:0.18",memory)) :- on("t:0.18").
holds(view(we(16),eba(z(listener(16))))) :- on("t:0.18").
fired("t:0.18",view(we(16),eba(z(listener(16))))) :- on("t:0.18").
% t:0.19
on("t:0.19").
via("t:0.19",clues) :- on("t:0.19").
fired("t:0.19",via("t:0.19",clues)) :- on("t:0.19").
clash(view(alazu,notall("t:0.19"))) :- fits(i("t:0.19",1),P1), holds(view(alazu,P1)), fits(i("t:0.19",2),P2), holds(view(alazu,P2)), on("t:0.19").
fired("t:0.19",view(alazu,notall("t:0.19"))) :- fits(i("t:0.19",1),P1), holds(view(alazu,P1)), fits(i("t:0.19",2),P2), holds(view(alazu,P2)), on("t:0.19").
used("t:0.19",view(alazu,notall("t:0.19")),view(alazu,P1)) :- fits(i("t:0.19",1),P1), holds(view(alazu,P1)), fits(i("t:0.19",2),P2), holds(view(alazu,P2)), on("t:0.19").
used("t:0.19",view(alazu,notall("t:0.19")),view(alazu,P2)) :- fits(i("t:0.19",1),P1), holds(view(alazu,P1)), fits(i("t:0.19",2),P2), holds(view(alazu,P2)), on("t:0.19").
% t:0.20
on("t:0.20").
via("t:0.20",clues) :- on("t:0.20").
fired("t:0.20",via("t:0.20",clues)) :- on("t:0.20").
holds(view(alazu,owuro(z(azozo)))) :- on("t:0.20").
fired("t:0.20",view(alazu,owuro(z(azozo)))) :- on("t:0.20").
% t:0.21
on("t:0.21").
via("t:0.21",clues) :- on("t:0.21").
fired("t:0.21",via("t:0.21",clues)) :- on("t:0.21").
holds(view(alazu,eruvo(z(azozo)))) :- on("t:0.21").
fired("t:0.21",view(alazu,eruvo(z(azozo)))) :- on("t:0.21").
% t:0.22
on("t:0.22").
via("t:0.22",clues) :- on("t:0.22").
fired("t:0.22",via("t:0.22",clues)) :- on("t:0.22").
holds(view(alazu,owuro(z(azozo)))) :- on("t:0.22").
fired("t:0.22",view(alazu,owuro(z(azozo)))) :- on("t:0.22").
% t:0.23
on("t:0.23").
via("t:0.23",clues) :- on("t:0.23").
fired("t:0.23",via("t:0.23",clues)) :- on("t:0.23").
holds(view(alazu,eruvo(z(azozo)))) :- on("t:0.23").
fired("t:0.23",view(alazu,eruvo(z(azozo)))) :- on("t:0.23").
% t:0.24
on("t:0.24").
via("t:0.24",clues) :- on("t:0.24").
fired("t:0.24",via("t:0.24",clues)) :- on("t:0.24").
clash(view(azozo,none("t:0.24"))) :- holds(view(azozo,isa(X,odoze))), on("t:0.24").
fired("t:0.24",view(azozo,none("t:0.24"))) :- holds(view(azozo,isa(X,odoze))), on("t:0.24").
used("t:0.24",view(azozo,none("t:0.24")),view(azozo,isa(X,odoze))) :- holds(view(azozo,isa(X,odoze))), on("t:0.24").
% t:0.25
on("t:0.25").
via("t:0.25",clues) :- on("t:0.25").
fired("t:0.25",via("t:0.25",clues)) :- on("t:0.25").
holds(view(azozo,isa(azozo,odoze))) :- on("t:0.25").
fired("t:0.25",view(azozo,isa(azozo,odoze))) :- on("t:0.25").
% t:0.26
on("t:0.26").
via("t:0.26",clues) :- on("t:0.26").
fired("t:0.26",via("t:0.26",clues)) :- on("t:0.26").
holds(view(azozo,isa(azozo,odoze))) :- on("t:0.26").
fired("t:0.26",view(azozo,isa(azozo,odoze))) :- on("t:0.26").
% t:0.27
on("t:0.27").
via("t:0.27",clues) :- on("t:0.27").
fired("t:0.27",via("t:0.27",clues)) :- on("t:0.27").
holds(view(alazu,say(rules,v,u,a,l,owuro(z(azozo))))) :- on("t:0.27").
fired("t:0.27",view(alazu,say(rules,v,u,a,l,owuro(z(azozo))))) :- on("t:0.27").
% t:0.28
on("t:0.28").
via("t:0.28",clues) :- on("t:0.28").
fired("t:0.28",via("t:0.28",clues)) :- on("t:0.28").
holds(view(alazu,say(rules,v,u,u,l,owuro(z(azozo))))) :- on("t:0.28").
fired("t:0.28",view(alazu,say(rules,v,u,u,l,owuro(z(azozo))))) :- on("t:0.28").
% t:0.29
on("t:0.29").
via("t:0.29",clues) :- on("t:0.29").
fired("t:0.29",via("t:0.29",clues)) :- on("t:0.29").
holds(view(alazu,say(rules,v,u,u,l,owuro(z(azozo))))) :- on("t:0.29").
fired("t:0.29",view(alazu,say(rules,v,u,u,l,owuro(z(azozo))))) :- on("t:0.29").
% t:0.30
on("t:0.30").
via("t:0.30",reported) :- on("t:0.30").
fired("t:0.30",via("t:0.30",reported)) :- on("t:0.30").
holds(view(azozo,neg(uduru(z(alazu))))) :- on("t:0.30").
fired("t:0.30",view(azozo,neg(uduru(z(alazu))))) :- on("t:0.30").
% t:1.0
on("t:1.0").
% t:2.0
on("t:2.0").
via("t:2.0",clues) :- on("t:2.0").
fired("t:2.0",via("t:2.0",clues)) :- on("t:2.0").
holds(view(azozo,uduru(z(alazu)))) :- on("t:2.0").
fired("t:2.0",view(azozo,uduru(z(alazu)))) :- on("t:2.0").
% t:3.0
on("t:3.0").
% t:4.0
on("t:4.0").
via("t:4.0",clues) :- on("t:4.0").
fired("t:4.0",via("t:4.0",clues)) :- on("t:4.0").
holds(view(azozo,owuro(z(we(azozo,sp("Bea")))))) :- on("t:4.0").
fired("t:4.0",view(azozo,owuro(z(we(azozo,sp("Bea")))))) :- on("t:4.0").
% t:4.1
on("t:4.1").
via("t:4.1",clues) :- on("t:4.1").
fired("t:4.1",via("t:4.1",clues)) :- on("t:4.1").
holds(view(azozo,neg(owuro(z(we(azozo,sp("Bea"))))))) :- on("t:4.1").
fired("t:4.1",view(azozo,neg(owuro(z(we(azozo,sp("Bea"))))))) :- on("t:4.1").
% t:4.2
on("t:4.2").
via("t:4.2",clues) :- on("t:4.2").
fired("t:4.2",via("t:4.2",clues)) :- on("t:4.2").
holds(view(azozo,uduru(z(alazu)))) :- on("t:4.2").
fired("t:4.2",view(azozo,uduru(z(alazu)))) :- on("t:4.2").
% t:4.3
on("t:4.3").
holds(uduru(z(alazu))) :- on("t:4.3").
fired("t:4.3",uduru(z(alazu))) :- on("t:4.3").
% t:4.4
on("t:4.4").
holds(owuro(z(we(34)))) :- on("t:4.4").
fired("t:4.4",owuro(z(we(34)))) :- on("t:4.4").
% t:4.5
on("t:4.5").
via("t:4.5",clues) :- on("t:4.5").
fired("t:4.5",via("t:4.5",clues)) :- on("t:4.5").
holds(view(azozo,neg(owuro(z(we(azozo,sp("Bea"))))))) :- on("t:4.5").
fired("t:4.5",view(azozo,neg(owuro(z(we(azozo,sp("Bea"))))))) :- on("t:4.5").
% t:4.6
on("t:4.6").
via("t:4.6",clues) :- on("t:4.6").
fired("t:4.6",via("t:4.6",clues)) :- on("t:4.6").
holds(view(azozo,owuro(z(we(azozo,sp("Bea")))))) :- on("t:4.6").
fired("t:4.6",view(azozo,owuro(z(we(azozo,sp("Bea")))))) :- on("t:4.6").
% t:4.7
on("t:4.7").
holds(neg(owuro(z(we(37))))) :- on("t:4.7").
fired("t:4.7",neg(owuro(z(we(37))))) :- on("t:4.7").
% t:5.0
on("t:5.0").
% t:6.0
on("t:6.0").
via("t:6.0",clues) :- on("t:6.0").
fired("t:6.0",via("t:6.0",clues)) :- on("t:6.0").
holds(view(azozo,owuro(z(azozo)))) :- on("t:6.0").
fired("t:6.0",view(azozo,owuro(z(azozo)))) :- on("t:6.0").
% t:7.0
on("t:7.0").
% t:8.0
on("t:8.0").
via("t:8.0",clues) :- on("t:8.0").
fired("t:8.0",via("t:8.0",clues)) :- on("t:8.0").
holds(view(azozo,uduru(z(alazu)))) :- on("t:8.0").
fired("t:8.0",view(azozo,uduru(z(alazu)))) :- on("t:8.0").
% t:8.1
on("t:8.1").
via("t:8.1",clues) :- on("t:8.1").
fired("t:8.1",via("t:8.1",clues)) :- on("t:8.1").
holds(view(azozo,owuro(z(azozo)))) :- on("t:8.1").
fired("t:8.1",view(azozo,owuro(z(azozo)))) :- on("t:8.1").
% t:8.2
on("t:8.2").
via("t:8.2",clues) :- on("t:8.2").
fired("t:8.2",via("t:8.2",clues)) :- on("t:8.2").
holds(view(azozo,uduru(z(alazu)))) :- on("t:8.2").
fired("t:8.2",view(azozo,uduru(z(alazu)))) :- on("t:8.2").
% t:8.3
on("t:8.3").
holds(owuro(z(listener(42)))) :- on("t:8.3").
fired("t:8.3",owuro(z(listener(42)))) :- on("t:8.3").
% t:8.4
on("t:8.4").
via("t:8.4",clues) :- on("t:8.4").
fired("t:8.4",via("t:8.4",clues)) :- on("t:8.4").
holds(view(azozo,neg(owuro(z(sp("Bea")))))) :- on("t:8.4").
fired("t:8.4",view(azozo,neg(owuro(z(sp("Bea")))))) :- on("t:8.4").
% t:8.5
on("t:8.5").
holds(owuro(z(listener(44)))) :- on("t:8.5").
fired("t:8.5",owuro(z(listener(44)))) :- on("t:8.5").
% t:8.6
on("t:8.6").
via("t:8.6",clues) :- on("t:8.6").
fired("t:8.6",via("t:8.6",clues)) :- on("t:8.6").
holds(view(azozo,neg(owuro(z(azozo))))) :- on("t:8.6").
fired("t:8.6",view(azozo,neg(owuro(z(azozo))))) :- on("t:8.6").
% t:8.7
on("t:8.7").
via("t:8.7",clues) :- on("t:8.7").
fired("t:8.7",via("t:8.7",clues)) :- on("t:8.7").
holds(view(azozo,uduru(z(alazu)))) :- on("t:8.7").
fired("t:8.7",view(azozo,uduru(z(alazu)))) :- on("t:8.7").

% Fits, from match().
fits(c("t:0.12"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.12")).
fits(o("t:0.12"),uduru(z(alazu))).
fits(uduru(z(alazu)),o("t:0.12")).
fits(i("t:0.19",1),owuro(z(azozo))).
fits(owuro(z(azozo)),i("t:0.19",1)).
fits(i("t:0.19",2),eruvo(z(azozo))).
fits(eruvo(z(azozo)),i("t:0.19",2)).
