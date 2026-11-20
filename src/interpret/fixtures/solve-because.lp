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
% t:0.12 = bc1
% t:0.13 = bc2
% t:0.14 = bc3
% t:0.15 = bc4
% t:0.16 = bc7
% t:0.17 = bc8
% t:0.18 = bc9
% t:0.19 = bc10
% t:0.20 = bc11
% t:0.21 = bc12
% t:0.22 = bc13
% t:0.23 = bc14
% t:0.24 = bc15
% t:0.25 = bc16
% t:0.26 = bc17
% t:0.27 = bc18
% t:0.28 = bc19
% t:0.29 = bc5
% t:0.30 = bc6
% t:0.31 = undefined

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
holds(onlyif(c("t:0.7"),o("t:0.7"))) :- on("t:0.7").
fired("t:0.7",onlyif(c("t:0.7"),o("t:0.7"))) :- on("t:0.7").
holds(neg(owuro(z(azozo)))) :- holds(onlyif(c("t:0.7"),o("t:0.7"))), fits(P,c("t:0.7")), holds(neg(P)), on("t:0.7").
fired("t:0.7",neg(owuro(z(azozo)))) :- holds(onlyif(c("t:0.7"),o("t:0.7"))), fits(P,c("t:0.7")), holds(neg(P)), on("t:0.7").
used("t:0.7",neg(owuro(z(azozo))),onlyif(c("t:0.7"),o("t:0.7"))) :- holds(onlyif(c("t:0.7"),o("t:0.7"))), fits(P,c("t:0.7")), holds(neg(P)), on("t:0.7").
used("t:0.7",neg(owuro(z(azozo))),neg(P)) :- holds(onlyif(c("t:0.7"),o("t:0.7"))), fits(P,c("t:0.7")), holds(neg(P)), on("t:0.7").
holds(ezuve(z(alazu))) :- holds(onlyif(c("t:0.7"),o("t:0.7"))), fits(o("t:0.7"),P), holds(P), on("t:0.7").
fired("t:0.7",ezuve(z(alazu))) :- holds(onlyif(c("t:0.7"),o("t:0.7"))), fits(o("t:0.7"),P), holds(P), on("t:0.7").
used("t:0.7",ezuve(z(alazu)),onlyif(c("t:0.7"),o("t:0.7"))) :- holds(onlyif(c("t:0.7"),o("t:0.7"))), fits(o("t:0.7"),P), holds(P), on("t:0.7").
used("t:0.7",ezuve(z(alazu)),P) :- holds(onlyif(c("t:0.7"),o("t:0.7"))), fits(o("t:0.7"),P), holds(P), on("t:0.7").
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
% t:0.12
on("t:0.12").
holds(isa(nm("t:0.12",z),erula)) :- on("t:0.12").
fired("t:0.12",isa(nm("t:0.12",z),erula)) :- on("t:0.12").
holds(isa(nm("t:0.12",bl),ugala)) :- on("t:0.12").
fired("t:0.12",isa(nm("t:0.12",bl),ugala)) :- on("t:0.12").
holds(cause(isa(nm("t:0.12",bl),ugala),isa(nm("t:0.12",z),erula))) :- on("t:0.12").
fired("t:0.12",cause(isa(nm("t:0.12",bl),ugala),isa(nm("t:0.12",z),erula))) :- on("t:0.12").
% t:0.13
on("t:0.13").
holds(if(c("t:0.13"),o("t:0.13"))) :- on("t:0.13").
fired("t:0.13",if(c("t:0.13"),o("t:0.13"))) :- on("t:0.13").
holds(isa(nm("t:0.13",z),erula)) :- holds(if(c("t:0.13"),o("t:0.13"))), fits(c("t:0.13"),P), holds(P), on("t:0.13").
fired("t:0.13",isa(nm("t:0.13",z),erula)) :- holds(if(c("t:0.13"),o("t:0.13"))), fits(c("t:0.13"),P), holds(P), on("t:0.13").
used("t:0.13",isa(nm("t:0.13",z),erula),if(c("t:0.13"),o("t:0.13"))) :- holds(if(c("t:0.13"),o("t:0.13"))), fits(c("t:0.13"),P), holds(P), on("t:0.13").
used("t:0.13",isa(nm("t:0.13",z),erula),P) :- holds(if(c("t:0.13"),o("t:0.13"))), fits(c("t:0.13"),P), holds(P), on("t:0.13").
% t:0.14
on("t:0.14").
holds(onlyif(c("t:0.14"),o("t:0.14"))) :- on("t:0.14").
fired("t:0.14",onlyif(c("t:0.14"),o("t:0.14"))) :- on("t:0.14").
holds(neg(ayebe(z(ahela),d(evela)))) :- holds(onlyif(c("t:0.14"),o("t:0.14"))), fits(P,c("t:0.14")), holds(neg(P)), on("t:0.14").
fired("t:0.14",neg(ayebe(z(ahela),d(evela)))) :- holds(onlyif(c("t:0.14"),o("t:0.14"))), fits(P,c("t:0.14")), holds(neg(P)), on("t:0.14").
used("t:0.14",neg(ayebe(z(ahela),d(evela))),onlyif(c("t:0.14"),o("t:0.14"))) :- holds(onlyif(c("t:0.14"),o("t:0.14"))), fits(P,c("t:0.14")), holds(neg(P)), on("t:0.14").
used("t:0.14",neg(ayebe(z(ahela),d(evela))),neg(P)) :- holds(onlyif(c("t:0.14"),o("t:0.14"))), fits(P,c("t:0.14")), holds(neg(P)), on("t:0.14").
holds(ezalo) :- holds(onlyif(c("t:0.14"),o("t:0.14"))), fits(o("t:0.14"),P), holds(P), on("t:0.14").
fired("t:0.14",ezalo) :- holds(onlyif(c("t:0.14"),o("t:0.14"))), fits(o("t:0.14"),P), holds(P), on("t:0.14").
used("t:0.14",ezalo,onlyif(c("t:0.14"),o("t:0.14"))) :- holds(onlyif(c("t:0.14"),o("t:0.14"))), fits(o("t:0.14"),P), holds(P), on("t:0.14").
used("t:0.14",ezalo,P) :- holds(onlyif(c("t:0.14"),o("t:0.14"))), fits(o("t:0.14"),P), holds(P), on("t:0.14").
% t:0.15
on("t:0.15").
holds(owuro(z(azozo))) :- on("t:0.15").
fired("t:0.15",owuro(z(azozo))) :- on("t:0.15").
holds(erula) :- on("t:0.15").
fired("t:0.15",erula) :- on("t:0.15").
holds(cause(erula,owuro(z(azozo)))) :- on("t:0.15").
fired("t:0.15",cause(erula,owuro(z(azozo)))) :- on("t:0.15").
% t:0.16
on("t:0.16").
holds(isa(nm("t:0.16",z),erula)) :- on("t:0.16").
fired("t:0.16",isa(nm("t:0.16",z),erula)) :- on("t:0.16").
holds(isa(nm("t:0.16",bl),ugala)) :- on("t:0.16").
fired("t:0.16",isa(nm("t:0.16",bl),ugala)) :- on("t:0.16").
holds(cause(isa(nm("t:0.16",bl),ugala),isa(nm("t:0.16",z),erula))) :- on("t:0.16").
fired("t:0.16",cause(isa(nm("t:0.16",bl),ugala),isa(nm("t:0.16",z),erula))) :- on("t:0.16").
holds(onlyif(c("t:0.16"),o("t:0.16"))) :- on("t:0.16").
fired("t:0.16",onlyif(c("t:0.16"),o("t:0.16"))) :- on("t:0.16").
holds(isa(nm("t:0.16",bl),ugala)) :- holds(onlyif(c("t:0.16"),o("t:0.16"))), fits(o("t:0.16"),P), holds(P), on("t:0.16").
fired("t:0.16",isa(nm("t:0.16",bl),ugala)) :- holds(onlyif(c("t:0.16"),o("t:0.16"))), fits(o("t:0.16"),P), holds(P), on("t:0.16").
used("t:0.16",isa(nm("t:0.16",bl),ugala),onlyif(c("t:0.16"),o("t:0.16"))) :- holds(onlyif(c("t:0.16"),o("t:0.16"))), fits(o("t:0.16"),P), holds(P), on("t:0.16").
used("t:0.16",isa(nm("t:0.16",bl),ugala),P) :- holds(onlyif(c("t:0.16"),o("t:0.16"))), fits(o("t:0.16"),P), holds(P), on("t:0.16").
% t:0.17
on("t:0.17").
{ holds(ezuve(z(alazu))) } :- on("t:0.17").
fired("t:0.17",ezuve(z(alazu))) :- holds(ezuve(z(alazu))), on("t:0.17").
holds(owuro(z(azozo))) :- on("t:0.17").
fired("t:0.17",owuro(z(azozo))) :- on("t:0.17").
holds(may(ezuve(z(alazu)))) :- on("t:0.17").
fired("t:0.17",may(ezuve(z(alazu)))) :- on("t:0.17").
holds(cause(may(ezuve(z(alazu))),owuro(z(azozo)))) :- on("t:0.17").
fired("t:0.17",cause(may(ezuve(z(alazu))),owuro(z(azozo)))) :- on("t:0.17").
% t:0.18
on("t:0.18").
via("t:0.18",clues) :- on("t:0.18").
fired("t:0.18",via("t:0.18",clues)) :- on("t:0.18").
holds(owuro(z(azozo))) :- on("t:0.18").
fired("t:0.18",owuro(z(azozo))) :- on("t:0.18").
holds(view(ahela,ezuve(z(alazu)))) :- on("t:0.18").
fired("t:0.18",view(ahela,ezuve(z(alazu)))) :- on("t:0.18").
holds(cause(view(ahela,ezuve(z(alazu))),owuro(z(azozo)))) :- on("t:0.18").
fired("t:0.18",cause(view(ahela,ezuve(z(alazu))),owuro(z(azozo)))) :- on("t:0.18").
% t:0.19
on("t:0.19").
holds(owuro(z(azozo))) :- on("t:0.19").
fired("t:0.19",owuro(z(azozo))) :- on("t:0.19").
holds(say(sp("a"),v,u,a,m,owuro(z(azozo)))) :- on("t:0.19").
fired("t:0.19",say(sp("a"),v,u,a,m,owuro(z(azozo)))) :- on("t:0.19").
holds(cause(say(sp("a"),v,u,a,m,owuro(z(azozo))),owuro(z(azozo)))) :- on("t:0.19").
fired("t:0.19",cause(say(sp("a"),v,u,a,m,owuro(z(azozo))),owuro(z(azozo)))) :- on("t:0.19").
% t:0.20
on("t:0.20").
holds(owuro(z(azozo))) :- on("t:0.20").
fired("t:0.20",owuro(z(azozo))) :- on("t:0.20").
holds(erula) :- on("t:0.20").
fired("t:0.20",erula) :- on("t:0.20").
holds(may(cause(erula,owuro(z(azozo))))) :- on("t:0.20").
fired("t:0.20",may(cause(erula,owuro(z(azozo))))) :- on("t:0.20").
{ maybe("t:0.20") } :- on("t:0.20").
fired("t:0.20",maybe("t:0.20")) :- maybe("t:0.20"), on("t:0.20").
holds(cause(erula,owuro(z(azozo)))) :- maybe("t:0.20"), on("t:0.20").
fired("t:0.20",cause(erula,owuro(z(azozo)))) :- maybe("t:0.20"), on("t:0.20").
% t:0.21
on("t:0.21").
holds(neg(owuro(z(azozo)))) :- on("t:0.21").
fired("t:0.21",neg(owuro(z(azozo)))) :- on("t:0.21").
% t:0.22
on("t:0.22").
holds(owuro(z(azozo))) :- on("t:0.22").
fired("t:0.22",owuro(z(azozo))) :- on("t:0.22").
holds(ezuyo(z(alazu))) :- on("t:0.22").
fired("t:0.22",ezuyo(z(alazu))) :- on("t:0.22").
holds(may(cause(ezuyo(z(alazu)),owuro(z(azozo))))) :- on("t:0.22").
fired("t:0.22",may(cause(ezuyo(z(alazu)),owuro(z(azozo))))) :- on("t:0.22").
{ maybe("t:0.22") } :- on("t:0.22").
fired("t:0.22",maybe("t:0.22")) :- maybe("t:0.22"), on("t:0.22").
holds(cause(ezuyo(z(alazu)),owuro(z(azozo)))) :- maybe("t:0.22"), on("t:0.22").
fired("t:0.22",cause(ezuyo(z(alazu)),owuro(z(azozo)))) :- maybe("t:0.22"), on("t:0.22").
holds(fault(ezuyo(z(alazu)),owuro(z(azozo)))) :- maybe("t:0.22"), on("t:0.22").
fired("t:0.22",fault(ezuyo(z(alazu)),owuro(z(azozo)))) :- maybe("t:0.22"), on("t:0.22").
% t:0.23
on("t:0.23").
holds(ezuve(z(alazu))) :- on("t:0.23").
fired("t:0.23",ezuve(z(alazu))) :- on("t:0.23").
% t:0.24
on("t:0.24").
holds(ezuve(z(alazu))) :- on("t:0.24").
fired("t:0.24",ezuve(z(alazu))) :- on("t:0.24").
{ holds(owuro(z(azozo))) } :- on("t:0.24").
fired("t:0.24",owuro(z(azozo))) :- holds(owuro(z(azozo))), on("t:0.24").
holds(may(owuro(z(azozo)))) :- on("t:0.24").
fired("t:0.24",may(owuro(z(azozo)))) :- on("t:0.24").
holds(cause(ezuve(z(alazu)),may(owuro(z(azozo))))) :- on("t:0.24").
fired("t:0.24",cause(ezuve(z(alazu)),may(owuro(z(azozo))))) :- on("t:0.24").
% t:0.25
on("t:0.25").
holds(owuro(z(azozo))) :- on("t:0.25").
fired("t:0.25",owuro(z(azozo))) :- on("t:0.25").
holds(erula) :- on("t:0.25").
fired("t:0.25",erula) :- on("t:0.25").
holds(cause(erula,owuro(z(azozo)))) :- on("t:0.25").
fired("t:0.25",cause(erula,owuro(z(azozo)))) :- on("t:0.25").
always(owuro(z(azozo))) :- on("t:0.25").
fired("t:0.25",always(owuro(z(azozo)))) :- on("t:0.25").
always(erula) :- on("t:0.25").
fired("t:0.25",always(erula)) :- on("t:0.25").
always(cause(erula,owuro(z(azozo)))) :- on("t:0.25").
fired("t:0.25",always(cause(erula,owuro(z(azozo))))) :- on("t:0.25").
% t:0.26
on("t:0.26").
holds(neg(owuro(z(azozo)))) :- on("t:0.26").
fired("t:0.26",neg(owuro(z(azozo)))) :- on("t:0.26").
never(owuro(z(azozo))) :- on("t:0.26").
fired("t:0.26",never(owuro(z(azozo)))) :- on("t:0.26").
% t:0.27
on("t:0.27").
{ maybe("t:0.27") } :- on("t:0.27").
fired("t:0.27",maybe("t:0.27")) :- maybe("t:0.27"), on("t:0.27").
maybe("t:0.27") :- switch(defaults), on("t:0.27").
fired("t:0.27",maybe("t:0.27")) :- switch(defaults), on("t:0.27").
holds(owuro(z(azozo))) :- maybe("t:0.27"), on("t:0.27").
fired("t:0.27",owuro(z(azozo))) :- maybe("t:0.27"), on("t:0.27").
holds(erula) :- maybe("t:0.27"), on("t:0.27").
fired("t:0.27",erula) :- maybe("t:0.27"), on("t:0.27").
holds(cause(erula,owuro(z(azozo)))) :- maybe("t:0.27"), on("t:0.27").
fired("t:0.27",cause(erula,owuro(z(azozo)))) :- maybe("t:0.27"), on("t:0.27").
% t:0.28
on("t:0.28").
{ holds(erula) } :- on("t:0.28").
fired("t:0.28",erula) :- holds(erula), on("t:0.28").
{ holds(ugala) } :- on("t:0.28").
fired("t:0.28",ugala) :- holds(ugala), on("t:0.28").
some("t:0.28") :- fits(i("t:0.28",1),P1), holds(P1), on("t:0.28").
fired("t:0.28",some("t:0.28")) :- fits(i("t:0.28",1),P1), holds(P1), on("t:0.28").
used("t:0.28",some("t:0.28"),P1) :- fits(i("t:0.28",1),P1), holds(P1), on("t:0.28").
some("t:0.28") :- fits(i("t:0.28",2),P2), holds(P2), on("t:0.28").
fired("t:0.28",some("t:0.28")) :- fits(i("t:0.28",2),P2), holds(P2), on("t:0.28").
used("t:0.28",some("t:0.28"),P2) :- fits(i("t:0.28",2),P2), holds(P2), on("t:0.28").
clash(noneof("t:0.28")) :- not some("t:0.28"), on("t:0.28").
fired("t:0.28",noneof("t:0.28")) :- not some("t:0.28"), on("t:0.28").
holds(erula) :- fits(N2,i("t:0.28",2)), holds(neg(N2)), on("t:0.28").
fired("t:0.28",erula) :- fits(N2,i("t:0.28",2)), holds(neg(N2)), on("t:0.28").
used("t:0.28",erula,neg(N2)) :- fits(N2,i("t:0.28",2)), holds(neg(N2)), on("t:0.28").
holds(ugala) :- fits(N1,i("t:0.28",1)), holds(neg(N1)), on("t:0.28").
fired("t:0.28",ugala) :- fits(N1,i("t:0.28",1)), holds(neg(N1)), on("t:0.28").
used("t:0.28",ugala,neg(N1)) :- fits(N1,i("t:0.28",1)), holds(neg(N1)), on("t:0.28").
holds(neg(ugala)) :- fits(i("t:0.28",1),P1), holds(P1), on("t:0.28").
fired("t:0.28",neg(ugala)) :- fits(i("t:0.28",1),P1), holds(P1), on("t:0.28").
used("t:0.28",neg(ugala),P1) :- fits(i("t:0.28",1),P1), holds(P1), on("t:0.28").
holds(neg(erula)) :- fits(i("t:0.28",2),P2), holds(P2), on("t:0.28").
fired("t:0.28",neg(erula)) :- fits(i("t:0.28",2),P2), holds(P2), on("t:0.28").
used("t:0.28",neg(erula),P2) :- fits(i("t:0.28",2),P2), holds(P2), on("t:0.28").
holds(owuro(z(azozo))) :- on("t:0.28").
fired("t:0.28",owuro(z(azozo))) :- on("t:0.28").
holds(cause(erula,owuro(z(azozo)))) :- holds(erula), on("t:0.28").
fired("t:0.28",cause(erula,owuro(z(azozo)))) :- holds(erula), on("t:0.28").
used("t:0.28",cause(erula,owuro(z(azozo))),erula) :- holds(erula), on("t:0.28").
holds(cause(ugala,owuro(z(azozo)))) :- holds(ugala), on("t:0.28").
fired("t:0.28",cause(ugala,owuro(z(azozo)))) :- holds(ugala), on("t:0.28").
used("t:0.28",cause(ugala,owuro(z(azozo))),ugala) :- holds(ugala), on("t:0.28").
% t:0.29
on("t:0.29").
{ maybe("t:0.29") } :- on("t:0.29").
fired("t:0.29",maybe("t:0.29")) :- maybe("t:0.29"), on("t:0.29").
maybe("t:0.29") :- switch(defaults), on("t:0.29").
fired("t:0.29",maybe("t:0.29")) :- switch(defaults), on("t:0.29").
holds(isa(alazu,enemu)) :- maybe("t:0.29"), on("t:0.29").
fired("t:0.29",isa(alazu,enemu)) :- maybe("t:0.29"), on("t:0.29").
holds(ezuyo(z(azozo))) :- maybe("t:0.29"), on("t:0.29").
fired("t:0.29",ezuyo(z(azozo))) :- maybe("t:0.29"), on("t:0.29").
holds(cause(ezuyo(z(azozo)),isa(alazu,enemu))) :- maybe("t:0.29"), on("t:0.29").
fired("t:0.29",cause(ezuyo(z(azozo)),isa(alazu,enemu))) :- maybe("t:0.29"), on("t:0.29").
holds(fault(ezuyo(z(azozo)),isa(alazu,enemu))) :- maybe("t:0.29"), on("t:0.29").
fired("t:0.29",fault(ezuyo(z(azozo)),isa(alazu,enemu))) :- maybe("t:0.29"), on("t:0.29").
% t:0.30
on("t:0.30").
via("t:0.30",clues) :- on("t:0.30").
fired("t:0.30",via("t:0.30",clues)) :- on("t:0.30").
holds(view(azozo,uduru(z(alazu)))) :- on("t:0.30").
fired("t:0.30",view(azozo,uduru(z(alazu)))) :- on("t:0.30").
holds(view(azozo,erula)) :- on("t:0.30").
fired("t:0.30",view(azozo,erula)) :- on("t:0.30").
holds(view(azozo,cause(erula,uduru(z(alazu))))) :- on("t:0.30").
fired("t:0.30",view(azozo,cause(erula,uduru(z(alazu))))) :- on("t:0.30").
% t:0.31
on("t:0.31").
via("t:0.31",clues) :- on("t:0.31").
fired("t:0.31",via("t:0.31",clues)) :- on("t:0.31").
holds(view(azozo,neg(uduru(z(alazu))))) :- on("t:0.31").
fired("t:0.31",view(azozo,neg(uduru(z(alazu))))) :- on("t:0.31").

% Fits, from match().
fits(c("t:0.7"),ezuve(z(alazu))).
fits(ezuve(z(alazu)),c("t:0.7")).
fits(o("t:0.7"),owuro(z(azozo))).
fits(owuro(z(azozo)),o("t:0.7")).
fits(c("t:0.13"),isa(nm("t:0.12",bl),ugala)).
fits(isa(nm("t:0.12",bl),ugala),c("t:0.13")).
fits(c("t:0.13"),isa(nm("t:0.13",bl),ugala)).
fits(isa(nm("t:0.13",bl),ugala),c("t:0.13")).
fits(c("t:0.13"),isa(nm("t:0.16",bl),ugala)).
fits(isa(nm("t:0.16",bl),ugala),c("t:0.13")).
fits(c("t:0.13"),ugala).
fits(ugala,c("t:0.13")).
fits(o("t:0.13"),isa(nm("t:0.12",z),erula)).
fits(isa(nm("t:0.12",z),erula),o("t:0.13")).
fits(o("t:0.13"),isa(nm("t:0.13",z),erula)).
fits(isa(nm("t:0.13",z),erula),o("t:0.13")).
fits(o("t:0.13"),erula).
fits(erula,o("t:0.13")).
fits(o("t:0.13"),isa(nm("t:0.16",z),erula)).
fits(isa(nm("t:0.16",z),erula),o("t:0.13")).
fits(c("t:0.14"),ezalo).
fits(ezalo,c("t:0.14")).
fits(o("t:0.14"),ayebe(z(ahela),d(evela))).
fits(ayebe(z(ahela),d(evela)),o("t:0.14")).
fits(c("t:0.16"),isa(nm("t:0.12",bl),ugala)).
fits(isa(nm("t:0.12",bl),ugala),c("t:0.16")).
fits(c("t:0.16"),isa(nm("t:0.13",bl),ugala)).
fits(isa(nm("t:0.13",bl),ugala),c("t:0.16")).
fits(c("t:0.16"),isa(nm("t:0.16",bl),ugala)).
fits(isa(nm("t:0.16",bl),ugala),c("t:0.16")).
fits(c("t:0.16"),ugala).
fits(ugala,c("t:0.16")).
fits(o("t:0.16"),isa(nm("t:0.12",z),erula)).
fits(isa(nm("t:0.12",z),erula),o("t:0.16")).
fits(o("t:0.16"),isa(nm("t:0.13",z),erula)).
fits(isa(nm("t:0.13",z),erula),o("t:0.16")).
fits(o("t:0.16"),erula).
fits(erula,o("t:0.16")).
fits(o("t:0.16"),isa(nm("t:0.16",z),erula)).
fits(isa(nm("t:0.16",z),erula),o("t:0.16")).
fits(i("t:0.28",1),isa(nm("t:0.12",z),erula)).
fits(isa(nm("t:0.12",z),erula),i("t:0.28",1)).
fits(i("t:0.28",1),isa(nm("t:0.13",z),erula)).
fits(isa(nm("t:0.13",z),erula),i("t:0.28",1)).
fits(i("t:0.28",1),erula).
fits(erula,i("t:0.28",1)).
fits(i("t:0.28",1),isa(nm("t:0.16",z),erula)).
fits(isa(nm("t:0.16",z),erula),i("t:0.28",1)).
fits(i("t:0.28",2),isa(nm("t:0.12",bl),ugala)).
fits(isa(nm("t:0.12",bl),ugala),i("t:0.28",2)).
fits(i("t:0.28",2),isa(nm("t:0.13",bl),ugala)).
fits(isa(nm("t:0.13",bl),ugala),i("t:0.28",2)).
fits(i("t:0.28",2),isa(nm("t:0.16",bl),ugala)).
fits(isa(nm("t:0.16",bl),ugala),i("t:0.28",2)).
fits(i("t:0.28",2),ugala).
fits(ugala,i("t:0.28",2)).
