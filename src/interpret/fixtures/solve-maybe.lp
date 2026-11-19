% t:0.0 = m1
% t:0.1 = m2
% t:0.2 = m3
% t:0.3 = m4
% t:0.4 = m5
% t:0.5 = m6
% t:0.6 = m10
% t:0.7 = m11
% t:0.8 = m12
% t:0.9 = m13
% t:0.10 = m14
% t:0.11 = m15
% t:0.12 = m16
% t:0.13 = m17
% t:0.14 = m18
% t:0.15 = m19
% t:0.16 = m7
% t:0.17 = m8
% t:0.18 = m9
% t:0.19 = b6
% t:0.20 = undefined

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
{ holds(uduru(z(alazu))) } :- on("t:0.0").
fired("t:0.0",uduru(z(alazu))) :- holds(uduru(z(alazu))), on("t:0.0").
holds(may(uduru(z(alazu)))) :- on("t:0.0").
fired("t:0.0",may(uduru(z(alazu)))) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(neg(uduru(z(alazu)))) :- on("t:0.1").
fired("t:0.1",neg(uduru(z(alazu)))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(uduru(z(alazu))) :- on("t:0.2").
fired("t:0.2",uduru(z(alazu))) :- on("t:0.2").
% t:0.3
on("t:0.3").
{ holds(uduru(z(alazu))) } :- on("t:0.3").
fired("t:0.3",uduru(z(alazu))) :- holds(uduru(z(alazu))), on("t:0.3").
holds(may(uduru(z(alazu)))) :- on("t:0.3").
fired("t:0.3",may(uduru(z(alazu)))) :- on("t:0.3").
% t:0.4
on("t:0.4").
{ holds(neg(uduru(z(alazu)))) } :- on("t:0.4").
fired("t:0.4",neg(uduru(z(alazu)))) :- holds(neg(uduru(z(alazu)))), on("t:0.4").
holds(may(neg(uduru(z(alazu))))) :- on("t:0.4").
fired("t:0.4",may(neg(uduru(z(alazu))))) :- on("t:0.4").
% t:0.5
on("t:0.5").
holds(uduru(z(alazu))) :- on("t:0.5").
fired("t:0.5",uduru(z(alazu))) :- on("t:0.5").
% t:0.6
on("t:0.6").
{ maybe("t:0.6") } :- on("t:0.6").
fired("t:0.6",maybe("t:0.6")) :- maybe("t:0.6"), on("t:0.6").
holds(ehohe(z(alazu))) :- fits(c("t:0.6"),P), holds(P), maybe("t:0.6"), on("t:0.6").
fired("t:0.6",ehohe(z(alazu))) :- fits(c("t:0.6"),P), holds(P), maybe("t:0.6"), on("t:0.6").
used("t:0.6",ehohe(z(alazu)),P) :- fits(c("t:0.6"),P), holds(P), maybe("t:0.6"), on("t:0.6").
holds(neg(owuro(z(azozo)))) :- fits(P,o("t:0.6")), holds(neg(P)), maybe("t:0.6"), on("t:0.6").
fired("t:0.6",neg(owuro(z(azozo)))) :- fits(P,o("t:0.6")), holds(neg(P)), maybe("t:0.6"), on("t:0.6").
used("t:0.6",neg(owuro(z(azozo))),neg(P)) :- fits(P,o("t:0.6")), holds(neg(P)), maybe("t:0.6"), on("t:0.6").
% t:0.7
on("t:0.7").
holds(owuro(z(azozo))) :- on("t:0.7").
fired("t:0.7",owuro(z(azozo))) :- on("t:0.7").
% t:0.8
on("t:0.8").
{ holds(ehohe(z(alazu))) } :- fits(c("t:0.8"),P), holds(P), on("t:0.8").
fired("t:0.8",ehohe(z(alazu))) :- holds(ehohe(z(alazu))), fits(c("t:0.8"),P), holds(P), on("t:0.8").
used("t:0.8",ehohe(z(alazu)),P) :- holds(ehohe(z(alazu))), fits(c("t:0.8"),P), holds(P), on("t:0.8").
% t:0.9
on("t:0.9").
holds(owuro(z(azozo))) :- on("t:0.9").
fired("t:0.9",owuro(z(azozo))) :- on("t:0.9").
% t:0.10
on("t:0.10").
holds(may(P)) :- fits(c("t:0.10"),P), holds(P), on("t:0.10").
fired("t:0.10",may(P)) :- fits(c("t:0.10"),P), holds(P), on("t:0.10").
used("t:0.10",may(P),P) :- fits(c("t:0.10"),P), holds(P), on("t:0.10").
holds(ehohe(z(alazu))) :- fits(c("t:0.10"),P), holds(may(P)), on("t:0.10").
fired("t:0.10",ehohe(z(alazu))) :- fits(c("t:0.10"),P), holds(may(P)), on("t:0.10").
used("t:0.10",ehohe(z(alazu)),may(P)) :- fits(c("t:0.10"),P), holds(may(P)), on("t:0.10").
% t:0.11
on("t:0.11").
{ maybe("t:0.11") } :- on("t:0.11").
fired("t:0.11",maybe("t:0.11")) :- maybe("t:0.11"), on("t:0.11").
{ holds(owuro(z(azozo))) } :- maybe("t:0.11"), on("t:0.11").
fired("t:0.11",owuro(z(azozo))) :- holds(owuro(z(azozo))), maybe("t:0.11"), on("t:0.11").
{ holds(eruvo(z(azozo))) } :- maybe("t:0.11"), on("t:0.11").
fired("t:0.11",eruvo(z(azozo))) :- holds(eruvo(z(azozo))), maybe("t:0.11"), on("t:0.11").
some("t:0.11") :- fits(i("t:0.11",1),P1), holds(P1), maybe("t:0.11"), on("t:0.11").
fired("t:0.11",some("t:0.11")) :- fits(i("t:0.11",1),P1), holds(P1), maybe("t:0.11"), on("t:0.11").
used("t:0.11",some("t:0.11"),P1) :- fits(i("t:0.11",1),P1), holds(P1), maybe("t:0.11"), on("t:0.11").
some("t:0.11") :- fits(i("t:0.11",2),P2), holds(P2), maybe("t:0.11"), on("t:0.11").
fired("t:0.11",some("t:0.11")) :- fits(i("t:0.11",2),P2), holds(P2), maybe("t:0.11"), on("t:0.11").
used("t:0.11",some("t:0.11"),P2) :- fits(i("t:0.11",2),P2), holds(P2), maybe("t:0.11"), on("t:0.11").
clash(noneof("t:0.11")) :- not some("t:0.11"), maybe("t:0.11"), on("t:0.11").
fired("t:0.11",noneof("t:0.11")) :- not some("t:0.11"), maybe("t:0.11"), on("t:0.11").
holds(owuro(z(azozo))) :- fits(N2,i("t:0.11",2)), holds(neg(N2)), maybe("t:0.11"), on("t:0.11").
fired("t:0.11",owuro(z(azozo))) :- fits(N2,i("t:0.11",2)), holds(neg(N2)), maybe("t:0.11"), on("t:0.11").
used("t:0.11",owuro(z(azozo)),neg(N2)) :- fits(N2,i("t:0.11",2)), holds(neg(N2)), maybe("t:0.11"), on("t:0.11").
holds(eruvo(z(azozo))) :- fits(N1,i("t:0.11",1)), holds(neg(N1)), maybe("t:0.11"), on("t:0.11").
fired("t:0.11",eruvo(z(azozo))) :- fits(N1,i("t:0.11",1)), holds(neg(N1)), maybe("t:0.11"), on("t:0.11").
used("t:0.11",eruvo(z(azozo)),neg(N1)) :- fits(N1,i("t:0.11",1)), holds(neg(N1)), maybe("t:0.11"), on("t:0.11").
holds(neg(eruvo(z(azozo)))) :- fits(i("t:0.11",1),P1), holds(P1), maybe("t:0.11"), on("t:0.11").
fired("t:0.11",neg(eruvo(z(azozo)))) :- fits(i("t:0.11",1),P1), holds(P1), maybe("t:0.11"), on("t:0.11").
used("t:0.11",neg(eruvo(z(azozo))),P1) :- fits(i("t:0.11",1),P1), holds(P1), maybe("t:0.11"), on("t:0.11").
holds(neg(owuro(z(azozo)))) :- fits(i("t:0.11",2),P2), holds(P2), maybe("t:0.11"), on("t:0.11").
fired("t:0.11",neg(owuro(z(azozo)))) :- fits(i("t:0.11",2),P2), holds(P2), maybe("t:0.11"), on("t:0.11").
used("t:0.11",neg(owuro(z(azozo))),P2) :- fits(i("t:0.11",2),P2), holds(P2), maybe("t:0.11"), on("t:0.11").
% t:0.12
on("t:0.12").
{ holds(isa(ahela,ogoze)) } :- on("t:0.12").
fired("t:0.12",isa(ahela,ogoze)) :- holds(isa(ahela,ogoze)), on("t:0.12").
holds(may(isa(ahela,ogoze))) :- on("t:0.12").
fired("t:0.12",may(isa(ahela,ogoze))) :- on("t:0.12").
% t:0.13
on("t:0.13").
{ holds(ezuve(z(X))) } :- holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), on("t:0.13").
fired("t:0.13",ezuve(z(X))) :- holds(ezuve(z(X))), holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), on("t:0.13").
used("t:0.13",ezuve(z(X)),isa(X,ogoze)) :- holds(ezuve(z(X))), holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), on("t:0.13").
holds(ezuve(z(X))) :- holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), switch(defaults), on("t:0.13").
fired("t:0.13",ezuve(z(X))) :- holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), switch(defaults), on("t:0.13").
used("t:0.13",ezuve(z(X)),isa(X,ogoze)) :- holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), switch(defaults), on("t:0.13").
% t:0.14
on("t:0.14").
likely("t:0.14",v(70)) :- on("t:0.14").
fired("t:0.14",likely("t:0.14",v(70))) :- on("t:0.14").
{ holds(uduru(z(alazu))) } :- on("t:0.14").
fired("t:0.14",uduru(z(alazu))) :- holds(uduru(z(alazu))), on("t:0.14").
% t:0.15
on("t:0.15").
holds(uduru(z(alazu))) :- on("t:0.15").
fired("t:0.15",uduru(z(alazu))) :- on("t:0.15").
% t:0.16
on("t:0.16").
holds(neg(uduru(z(alazu)))) :- on("t:0.16").
fired("t:0.16",neg(uduru(z(alazu)))) :- on("t:0.16").
% t:0.17
on("t:0.17").
{ holds(view(azozo,uduru(z(alazu)))) } :- on("t:0.17").
fired("t:0.17",view(azozo,uduru(z(alazu)))) :- holds(view(azozo,uduru(z(alazu)))), on("t:0.17").
holds(may(view(azozo,uduru(z(alazu))))) :- on("t:0.17").
fired("t:0.17",may(view(azozo,uduru(z(alazu))))) :- on("t:0.17").
% t:0.18
on("t:0.18").
via("t:0.18",reported) :- on("t:0.18").
fired("t:0.18",via("t:0.18",reported)) :- on("t:0.18").
holds(view(azozo,neg(uduru(z(alazu))))) :- on("t:0.18").
fired("t:0.18",view(azozo,neg(uduru(z(alazu))))) :- on("t:0.18").
% t:0.19
on("t:0.19").
via("t:0.19",clues) :- on("t:0.19").
fired("t:0.19",via("t:0.19",clues)) :- on("t:0.19").
holds(view(azozo,may(uduru(z(alazu))))) :- on("t:0.19").
fired("t:0.19",view(azozo,may(uduru(z(alazu))))) :- on("t:0.19").
% t:0.20
on("t:0.20").
{ holds(view(azozo,uduru(z(alazu)))) } :- on("t:0.20").
fired("t:0.20",view(azozo,uduru(z(alazu)))) :- holds(view(azozo,uduru(z(alazu)))), on("t:0.20").
holds(may(view(azozo,uduru(z(alazu))))) :- on("t:0.20").
fired("t:0.20",may(view(azozo,uduru(z(alazu))))) :- on("t:0.20").

% Fits, from match().
fits(c("t:0.6"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.6")).
fits(o("t:0.6"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.6")).
fits(c("t:0.8"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.8")).
fits(o("t:0.8"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.8")).
fits(c("t:0.10"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.10")).
fits(o("t:0.10"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.10")).
fits(i("t:0.11",1),owuro(z(azozo))).
fits(owuro(z(azozo)),i("t:0.11",1)).
fits(i("t:0.11",2),eruvo(z(azozo))).
fits(eruvo(z(azozo)),i("t:0.11",2)).
