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
% t:0.10 = c11
% t:0.11 = c12
% t:0.12 = c13
% t:0.13 = bc1
% t:0.14 = bc2
% t:0.15 = bc3
% t:0.16 = bc4
% t:0.17 = bc7
% t:0.18 = bc8
% t:0.19 = bc9
% t:0.20 = bc10
% t:0.21 = bc11
% t:0.22 = bc12
% t:0.23 = bc13
% t:0.24 = bc14
% t:0.25 = bc15
% t:0.26 = bc16
% t:0.27 = bc17
% t:0.28 = bc18
% t:0.29 = bc19
% t:0.30 = bc22
% t:0.31 = bc23
% t:0.32 = bc24
% t:0.33 = bc25
% t:0.34 = bc26
% t:0.35 = bc27
% t:1.0 = bc28
% t:1.1 = bc29
% t:1.2 = bc30
% t:1.3 = bc31
% t:1.4 = bc5
% t:1.5 = bc6
% t:1.6 = undefined
% t:1.7 = undefined

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
holds(owuro(z(azozo))) :- on("t:0.10").
fired("t:0.10",owuro(z(azozo))) :- on("t:0.10").
holds(against(owuro(z(azozo)),channel(reported,alazu))) :- on("t:0.10").
fired("t:0.10",against(owuro(z(azozo)),channel(reported,alazu))) :- on("t:0.10").
% t:0.11
on("t:0.11").
holds(say(rules,v,u,a,l,owuro(z(azozo)))) :- on("t:0.11").
fired("t:0.11",say(rules,v,u,a,l,owuro(z(azozo)))) :- on("t:0.11").
% t:0.12
on("t:0.12").
holds(ehohe(z(ahela))) :- on("t:0.12").
fired("t:0.12",ehohe(z(ahela))) :- on("t:0.12").
% t:0.13
on("t:0.13").
holds(isa(nm("t:0.13",z),erula)) :- on("t:0.13").
fired("t:0.13",isa(nm("t:0.13",z),erula)) :- on("t:0.13").
holds(isa(nm("t:0.13",bl),ugala)) :- on("t:0.13").
fired("t:0.13",isa(nm("t:0.13",bl),ugala)) :- on("t:0.13").
holds(cause(isa(nm("t:0.13",bl),ugala),isa(nm("t:0.13",z),erula))) :- on("t:0.13").
fired("t:0.13",cause(isa(nm("t:0.13",bl),ugala),isa(nm("t:0.13",z),erula))) :- on("t:0.13").
% t:0.14
on("t:0.14").
holds(if(c("t:0.14"),o("t:0.14"))) :- on("t:0.14").
fired("t:0.14",if(c("t:0.14"),o("t:0.14"))) :- on("t:0.14").
holds(isa(nm("t:0.14",z),erula)) :- holds(if(c("t:0.14"),o("t:0.14"))), fits(c("t:0.14"),P), holds(P), on("t:0.14").
fired("t:0.14",isa(nm("t:0.14",z),erula)) :- holds(if(c("t:0.14"),o("t:0.14"))), fits(c("t:0.14"),P), holds(P), on("t:0.14").
used("t:0.14",isa(nm("t:0.14",z),erula),if(c("t:0.14"),o("t:0.14"))) :- holds(if(c("t:0.14"),o("t:0.14"))), fits(c("t:0.14"),P), holds(P), on("t:0.14").
used("t:0.14",isa(nm("t:0.14",z),erula),P) :- holds(if(c("t:0.14"),o("t:0.14"))), fits(c("t:0.14"),P), holds(P), on("t:0.14").
% t:0.15
on("t:0.15").
holds(onlyif(c("t:0.15"),o("t:0.15"))) :- on("t:0.15").
fired("t:0.15",onlyif(c("t:0.15"),o("t:0.15"))) :- on("t:0.15").
holds(neg(ayebe(z(ahela),d(evela)))) :- holds(onlyif(c("t:0.15"),o("t:0.15"))), fits(P,c("t:0.15")), holds(neg(P)), on("t:0.15").
fired("t:0.15",neg(ayebe(z(ahela),d(evela)))) :- holds(onlyif(c("t:0.15"),o("t:0.15"))), fits(P,c("t:0.15")), holds(neg(P)), on("t:0.15").
used("t:0.15",neg(ayebe(z(ahela),d(evela))),onlyif(c("t:0.15"),o("t:0.15"))) :- holds(onlyif(c("t:0.15"),o("t:0.15"))), fits(P,c("t:0.15")), holds(neg(P)), on("t:0.15").
used("t:0.15",neg(ayebe(z(ahela),d(evela))),neg(P)) :- holds(onlyif(c("t:0.15"),o("t:0.15"))), fits(P,c("t:0.15")), holds(neg(P)), on("t:0.15").
holds(ezalo) :- holds(onlyif(c("t:0.15"),o("t:0.15"))), fits(o("t:0.15"),P), holds(P), on("t:0.15").
fired("t:0.15",ezalo) :- holds(onlyif(c("t:0.15"),o("t:0.15"))), fits(o("t:0.15"),P), holds(P), on("t:0.15").
used("t:0.15",ezalo,onlyif(c("t:0.15"),o("t:0.15"))) :- holds(onlyif(c("t:0.15"),o("t:0.15"))), fits(o("t:0.15"),P), holds(P), on("t:0.15").
used("t:0.15",ezalo,P) :- holds(onlyif(c("t:0.15"),o("t:0.15"))), fits(o("t:0.15"),P), holds(P), on("t:0.15").
% t:0.16
on("t:0.16").
holds(owuro(z(azozo))) :- on("t:0.16").
fired("t:0.16",owuro(z(azozo))) :- on("t:0.16").
holds(erula) :- on("t:0.16").
fired("t:0.16",erula) :- on("t:0.16").
holds(cause(erula,owuro(z(azozo)))) :- on("t:0.16").
fired("t:0.16",cause(erula,owuro(z(azozo)))) :- on("t:0.16").
% t:0.17
on("t:0.17").
holds(isa(nm("t:0.17",z),erula)) :- on("t:0.17").
fired("t:0.17",isa(nm("t:0.17",z),erula)) :- on("t:0.17").
holds(isa(nm("t:0.17",bl),ugala)) :- on("t:0.17").
fired("t:0.17",isa(nm("t:0.17",bl),ugala)) :- on("t:0.17").
holds(cause(isa(nm("t:0.17",bl),ugala),isa(nm("t:0.17",z),erula))) :- on("t:0.17").
fired("t:0.17",cause(isa(nm("t:0.17",bl),ugala),isa(nm("t:0.17",z),erula))) :- on("t:0.17").
holds(onlyif(c("t:0.17"),o("t:0.17"))) :- on("t:0.17").
fired("t:0.17",onlyif(c("t:0.17"),o("t:0.17"))) :- on("t:0.17").
holds(isa(nm("t:0.17",bl),ugala)) :- holds(onlyif(c("t:0.17"),o("t:0.17"))), fits(o("t:0.17"),P), holds(P), on("t:0.17").
fired("t:0.17",isa(nm("t:0.17",bl),ugala)) :- holds(onlyif(c("t:0.17"),o("t:0.17"))), fits(o("t:0.17"),P), holds(P), on("t:0.17").
used("t:0.17",isa(nm("t:0.17",bl),ugala),onlyif(c("t:0.17"),o("t:0.17"))) :- holds(onlyif(c("t:0.17"),o("t:0.17"))), fits(o("t:0.17"),P), holds(P), on("t:0.17").
used("t:0.17",isa(nm("t:0.17",bl),ugala),P) :- holds(onlyif(c("t:0.17"),o("t:0.17"))), fits(o("t:0.17"),P), holds(P), on("t:0.17").
% t:0.18
on("t:0.18").
{ holds(ezuve(z(alazu))) } :- on("t:0.18").
fired("t:0.18",ezuve(z(alazu))) :- holds(ezuve(z(alazu))), on("t:0.18").
holds(owuro(z(azozo))) :- on("t:0.18").
fired("t:0.18",owuro(z(azozo))) :- on("t:0.18").
holds(may(ezuve(z(alazu)))) :- on("t:0.18").
fired("t:0.18",may(ezuve(z(alazu)))) :- on("t:0.18").
holds(cause(may(ezuve(z(alazu))),owuro(z(azozo)))) :- on("t:0.18").
fired("t:0.18",cause(may(ezuve(z(alazu))),owuro(z(azozo)))) :- on("t:0.18").
% t:0.19
on("t:0.19").
via("t:0.19",clues) :- on("t:0.19").
fired("t:0.19",via("t:0.19",clues)) :- on("t:0.19").
holds(owuro(z(azozo))) :- on("t:0.19").
fired("t:0.19",owuro(z(azozo))) :- on("t:0.19").
holds(view(ahela,ezuve(z(alazu)))) :- on("t:0.19").
fired("t:0.19",view(ahela,ezuve(z(alazu)))) :- on("t:0.19").
holds(cause(view(ahela,ezuve(z(alazu))),owuro(z(azozo)))) :- on("t:0.19").
fired("t:0.19",cause(view(ahela,ezuve(z(alazu))),owuro(z(azozo)))) :- on("t:0.19").
% t:0.20
on("t:0.20").
holds(owuro(z(azozo))) :- on("t:0.20").
fired("t:0.20",owuro(z(azozo))) :- on("t:0.20").
holds(say(sp("a"),v,u,a,m,owuro(z(azozo)))) :- on("t:0.20").
fired("t:0.20",say(sp("a"),v,u,a,m,owuro(z(azozo)))) :- on("t:0.20").
holds(cause(say(sp("a"),v,u,a,m,owuro(z(azozo))),owuro(z(azozo)))) :- on("t:0.20").
fired("t:0.20",cause(say(sp("a"),v,u,a,m,owuro(z(azozo))),owuro(z(azozo)))) :- on("t:0.20").
% t:0.21
on("t:0.21").
holds(owuro(z(azozo))) :- on("t:0.21").
fired("t:0.21",owuro(z(azozo))) :- on("t:0.21").
holds(erula) :- on("t:0.21").
fired("t:0.21",erula) :- on("t:0.21").
holds(may(cause(erula,owuro(z(azozo))))) :- on("t:0.21").
fired("t:0.21",may(cause(erula,owuro(z(azozo))))) :- on("t:0.21").
{ maybe("t:0.21") } :- on("t:0.21").
fired("t:0.21",maybe("t:0.21")) :- maybe("t:0.21"), on("t:0.21").
holds(cause(erula,owuro(z(azozo)))) :- maybe("t:0.21"), on("t:0.21").
fired("t:0.21",cause(erula,owuro(z(azozo)))) :- maybe("t:0.21"), on("t:0.21").
% t:0.22
on("t:0.22").
holds(neg(owuro(z(azozo)))) :- on("t:0.22").
fired("t:0.22",neg(owuro(z(azozo)))) :- on("t:0.22").
% t:0.23
on("t:0.23").
holds(owuro(z(azozo))) :- on("t:0.23").
fired("t:0.23",owuro(z(azozo))) :- on("t:0.23").
holds(ezuyo(z(alazu))) :- on("t:0.23").
fired("t:0.23",ezuyo(z(alazu))) :- on("t:0.23").
holds(may(cause(ezuyo(z(alazu)),owuro(z(azozo))))) :- on("t:0.23").
fired("t:0.23",may(cause(ezuyo(z(alazu)),owuro(z(azozo))))) :- on("t:0.23").
{ maybe("t:0.23") } :- on("t:0.23").
fired("t:0.23",maybe("t:0.23")) :- maybe("t:0.23"), on("t:0.23").
holds(cause(ezuyo(z(alazu)),owuro(z(azozo)))) :- maybe("t:0.23"), on("t:0.23").
fired("t:0.23",cause(ezuyo(z(alazu)),owuro(z(azozo)))) :- maybe("t:0.23"), on("t:0.23").
holds(fault(ezuyo(z(alazu)),owuro(z(azozo)))) :- maybe("t:0.23"), on("t:0.23").
fired("t:0.23",fault(ezuyo(z(alazu)),owuro(z(azozo)))) :- maybe("t:0.23"), on("t:0.23").
% t:0.24
on("t:0.24").
holds(ezuve(z(alazu))) :- on("t:0.24").
fired("t:0.24",ezuve(z(alazu))) :- on("t:0.24").
% t:0.25
on("t:0.25").
holds(ezuve(z(alazu))) :- on("t:0.25").
fired("t:0.25",ezuve(z(alazu))) :- on("t:0.25").
{ holds(owuro(z(azozo))) } :- on("t:0.25").
fired("t:0.25",owuro(z(azozo))) :- holds(owuro(z(azozo))), on("t:0.25").
holds(may(owuro(z(azozo)))) :- on("t:0.25").
fired("t:0.25",may(owuro(z(azozo)))) :- on("t:0.25").
holds(cause(ezuve(z(alazu)),may(owuro(z(azozo))))) :- on("t:0.25").
fired("t:0.25",cause(ezuve(z(alazu)),may(owuro(z(azozo))))) :- on("t:0.25").
% t:0.26
on("t:0.26").
holds(owuro(z(azozo))) :- on("t:0.26").
fired("t:0.26",owuro(z(azozo))) :- on("t:0.26").
holds(erula) :- on("t:0.26").
fired("t:0.26",erula) :- on("t:0.26").
holds(cause(erula,owuro(z(azozo)))) :- on("t:0.26").
fired("t:0.26",cause(erula,owuro(z(azozo)))) :- on("t:0.26").
always(owuro(z(azozo))) :- on("t:0.26").
fired("t:0.26",always(owuro(z(azozo)))) :- on("t:0.26").
always(erula) :- on("t:0.26").
fired("t:0.26",always(erula)) :- on("t:0.26").
always(cause(erula,owuro(z(azozo)))) :- on("t:0.26").
fired("t:0.26",always(cause(erula,owuro(z(azozo))))) :- on("t:0.26").
% t:0.27
on("t:0.27").
holds(neg(owuro(z(azozo)))) :- on("t:0.27").
fired("t:0.27",neg(owuro(z(azozo)))) :- on("t:0.27").
never(owuro(z(azozo))) :- on("t:0.27").
fired("t:0.27",never(owuro(z(azozo)))) :- on("t:0.27").
% t:0.28
on("t:0.28").
{ maybe("t:0.28") } :- on("t:0.28").
fired("t:0.28",maybe("t:0.28")) :- maybe("t:0.28"), on("t:0.28").
maybe("t:0.28") :- switch(defaults), on("t:0.28").
fired("t:0.28",maybe("t:0.28")) :- switch(defaults), on("t:0.28").
holds(owuro(z(azozo))) :- maybe("t:0.28"), on("t:0.28").
fired("t:0.28",owuro(z(azozo))) :- maybe("t:0.28"), on("t:0.28").
holds(erula) :- maybe("t:0.28"), on("t:0.28").
fired("t:0.28",erula) :- maybe("t:0.28"), on("t:0.28").
holds(cause(erula,owuro(z(azozo)))) :- maybe("t:0.28"), on("t:0.28").
fired("t:0.28",cause(erula,owuro(z(azozo)))) :- maybe("t:0.28"), on("t:0.28").
% t:0.29
on("t:0.29").
{ holds(erula) } :- on("t:0.29").
fired("t:0.29",erula) :- holds(erula), on("t:0.29").
{ holds(ugala) } :- on("t:0.29").
fired("t:0.29",ugala) :- holds(ugala), on("t:0.29").
some("t:0.29") :- fits(i("t:0.29",1),P1), holds(P1), on("t:0.29").
fired("t:0.29",some("t:0.29")) :- fits(i("t:0.29",1),P1), holds(P1), on("t:0.29").
used("t:0.29",some("t:0.29"),P1) :- fits(i("t:0.29",1),P1), holds(P1), on("t:0.29").
some("t:0.29") :- fits(i("t:0.29",2),P2), holds(P2), on("t:0.29").
fired("t:0.29",some("t:0.29")) :- fits(i("t:0.29",2),P2), holds(P2), on("t:0.29").
used("t:0.29",some("t:0.29"),P2) :- fits(i("t:0.29",2),P2), holds(P2), on("t:0.29").
clash(noneof("t:0.29")) :- not some("t:0.29"), on("t:0.29").
fired("t:0.29",noneof("t:0.29")) :- not some("t:0.29"), on("t:0.29").
holds(erula) :- fits(N2,i("t:0.29",2)), holds(neg(N2)), on("t:0.29").
fired("t:0.29",erula) :- fits(N2,i("t:0.29",2)), holds(neg(N2)), on("t:0.29").
used("t:0.29",erula,neg(N2)) :- fits(N2,i("t:0.29",2)), holds(neg(N2)), on("t:0.29").
holds(ugala) :- fits(N1,i("t:0.29",1)), holds(neg(N1)), on("t:0.29").
fired("t:0.29",ugala) :- fits(N1,i("t:0.29",1)), holds(neg(N1)), on("t:0.29").
used("t:0.29",ugala,neg(N1)) :- fits(N1,i("t:0.29",1)), holds(neg(N1)), on("t:0.29").
holds(neg(ugala)) :- fits(i("t:0.29",1),P1), holds(P1), on("t:0.29").
fired("t:0.29",neg(ugala)) :- fits(i("t:0.29",1),P1), holds(P1), on("t:0.29").
used("t:0.29",neg(ugala),P1) :- fits(i("t:0.29",1),P1), holds(P1), on("t:0.29").
holds(neg(erula)) :- fits(i("t:0.29",2),P2), holds(P2), on("t:0.29").
fired("t:0.29",neg(erula)) :- fits(i("t:0.29",2),P2), holds(P2), on("t:0.29").
used("t:0.29",neg(erula),P2) :- fits(i("t:0.29",2),P2), holds(P2), on("t:0.29").
holds(owuro(z(azozo))) :- on("t:0.29").
fired("t:0.29",owuro(z(azozo))) :- on("t:0.29").
holds(cause(erula,owuro(z(azozo)))) :- holds(erula), on("t:0.29").
fired("t:0.29",cause(erula,owuro(z(azozo)))) :- holds(erula), on("t:0.29").
used("t:0.29",cause(erula,owuro(z(azozo))),erula) :- holds(erula), on("t:0.29").
holds(cause(ugala,owuro(z(azozo)))) :- holds(ugala), on("t:0.29").
fired("t:0.29",cause(ugala,owuro(z(azozo)))) :- holds(ugala), on("t:0.29").
used("t:0.29",cause(ugala,owuro(z(azozo))),ugala) :- holds(ugala), on("t:0.29").
% t:0.30
on("t:0.30").
{ maybe("t:0.30") } :- on("t:0.30").
fired("t:0.30",maybe("t:0.30")) :- maybe("t:0.30"), on("t:0.30").
maybe("t:0.30") :- switch(defaults), on("t:0.30").
fired("t:0.30",maybe("t:0.30")) :- switch(defaults), on("t:0.30").
holds(isa(alazu,enemu)) :- maybe("t:0.30"), on("t:0.30").
fired("t:0.30",isa(alazu,enemu)) :- maybe("t:0.30"), on("t:0.30").
holds(ezuyo(z(azozo))) :- maybe("t:0.30"), on("t:0.30").
fired("t:0.30",ezuyo(z(azozo))) :- maybe("t:0.30"), on("t:0.30").
holds(cause(ezuyo(z(azozo)),isa(alazu,enemu))) :- maybe("t:0.30"), on("t:0.30").
fired("t:0.30",cause(ezuyo(z(azozo)),isa(alazu,enemu))) :- maybe("t:0.30"), on("t:0.30").
holds(fault(ezuyo(z(azozo)),isa(alazu,enemu))) :- maybe("t:0.30"), on("t:0.30").
fired("t:0.30",fault(ezuyo(z(azozo)),isa(alazu,enemu))) :- maybe("t:0.30"), on("t:0.30").
% t:0.31
on("t:0.31").
{ holds(owuro(z(azozo))) } :- on("t:0.31").
fired("t:0.31",owuro(z(azozo))) :- holds(owuro(z(azozo))), on("t:0.31").
holds(against(owuro(z(azozo)),plan(sp("a")))) :- holds(owuro(z(azozo))), on("t:0.31").
fired("t:0.31",against(owuro(z(azozo)),plan(sp("a")))) :- holds(owuro(z(azozo))), on("t:0.31").
used("t:0.31",against(owuro(z(azozo)),plan(sp("a"))),owuro(z(azozo))) :- holds(owuro(z(azozo))), on("t:0.31").
holds(may(owuro(z(azozo)))) :- on("t:0.31").
fired("t:0.31",may(owuro(z(azozo)))) :- on("t:0.31").
% t:0.32
on("t:0.32").
holds(owuro(z(azozo))) :- on("t:0.32").
fired("t:0.32",owuro(z(azozo))) :- on("t:0.32").
holds(against(owuro(z(azozo)),plan(alazu))) :- on("t:0.32").
fired("t:0.32",against(owuro(z(azozo)),plan(alazu))) :- on("t:0.32").
% t:0.33
on("t:0.33").
holds(owuro(z(azozo))) :- on("t:0.33").
fired("t:0.33",owuro(z(azozo))) :- on("t:0.33").
holds(against(owuro(z(azozo)),channel(reported,alazu))) :- on("t:0.33").
fired("t:0.33",against(owuro(z(azozo)),channel(reported,alazu))) :- on("t:0.33").
% t:0.34
on("t:0.34").
holds(owuro(z(azozo))) :- on("t:0.34").
fired("t:0.34",owuro(z(azozo))) :- on("t:0.34").
holds(against(owuro(z(azozo)),channel(reported,sp("a")))) :- on("t:0.34").
fired("t:0.34",against(owuro(z(azozo)),channel(reported,sp("a")))) :- on("t:0.34").
% t:0.35
on("t:0.35").
holds(owuro(z(X))) :- holds(isa(X,odoze)), on("t:0.35").
fired("t:0.35",owuro(z(X))) :- holds(isa(X,odoze)), on("t:0.35").
used("t:0.35",owuro(z(X)),isa(X,odoze)) :- holds(isa(X,odoze)), on("t:0.35").
holds(against(owuro(z(X)),plan(sp("a")))) :- holds(isa(X,odoze)), on("t:0.35").
fired("t:0.35",against(owuro(z(X)),plan(sp("a")))) :- holds(isa(X,odoze)), on("t:0.35").
used("t:0.35",against(owuro(z(X)),plan(sp("a"))),isa(X,odoze)) :- holds(isa(X,odoze)), on("t:0.35").
% t:1.0
on("t:1.0").
holds(owuro(z(X))) :- holds(isa(X,odoze)), on("t:1.0").
fired("t:1.0",owuro(z(X))) :- holds(isa(X,odoze)), on("t:1.0").
used("t:1.0",owuro(z(X)),isa(X,odoze)) :- holds(isa(X,odoze)), on("t:1.0").
holds(against(owuro(z(X)),plan(sp("a")))) :- holds(isa(X,odoze)), on("t:1.0").
fired("t:1.0",against(owuro(z(X)),plan(sp("a")))) :- holds(isa(X,odoze)), on("t:1.0").
used("t:1.0",against(owuro(z(X)),plan(sp("a"))),isa(X,odoze)) :- holds(isa(X,odoze)), on("t:1.0").
% t:1.1
on("t:1.1").
holds(isa(azozo,odoze)) :- on("t:1.1").
fired("t:1.1",isa(azozo,odoze)) :- on("t:1.1").
% t:1.2
on("t:1.2").
holds(owuro(z(azozo))) :- on("t:1.2").
fired("t:1.2",owuro(z(azozo))) :- on("t:1.2").
always(owuro(z(azozo))) :- on("t:1.2").
fired("t:1.2",always(owuro(z(azozo)))) :- on("t:1.2").
holds(against(owuro(z(azozo)),plan(sp("a")))) :- on("t:1.2").
fired("t:1.2",against(owuro(z(azozo)),plan(sp("a")))) :- on("t:1.2").
always(against(owuro(z(azozo)),plan(sp("a")))) :- on("t:1.2").
fired("t:1.2",always(against(owuro(z(azozo)),plan(sp("a"))))) :- on("t:1.2").
% t:1.3
on("t:1.3").
holds(ezuyo(z(alazu))) :- on("t:1.3").
fired("t:1.3",ezuyo(z(alazu))) :- on("t:1.3").
% t:1.4
on("t:1.4").
holds(if(c("t:1.4"),o("t:1.4"))) :- on("t:1.4").
fired("t:1.4",if(c("t:1.4"),o("t:1.4"))) :- on("t:1.4").
holds(owuro(z(azozo))) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(c("t:1.4"),P), holds(P), on("t:1.4").
fired("t:1.4",owuro(z(azozo))) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(c("t:1.4"),P), holds(P), on("t:1.4").
used("t:1.4",owuro(z(azozo)),if(c("t:1.4"),o("t:1.4"))) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(c("t:1.4"),P), holds(P), on("t:1.4").
used("t:1.4",owuro(z(azozo)),P) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(c("t:1.4"),P), holds(P), on("t:1.4").
holds(against(owuro(z(azozo)),plan(sp("a")))) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(c("t:1.4"),P), holds(P), on("t:1.4").
fired("t:1.4",against(owuro(z(azozo)),plan(sp("a")))) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(c("t:1.4"),P), holds(P), on("t:1.4").
used("t:1.4",against(owuro(z(azozo)),plan(sp("a"))),if(c("t:1.4"),o("t:1.4"))) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(c("t:1.4"),P), holds(P), on("t:1.4").
used("t:1.4",against(owuro(z(azozo)),plan(sp("a"))),P) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(c("t:1.4"),P), holds(P), on("t:1.4").
holds(neg(ezuyo(z(alazu)))) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(P,o("t:1.4")), holds(neg(P)), on("t:1.4").
fired("t:1.4",neg(ezuyo(z(alazu)))) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(P,o("t:1.4")), holds(neg(P)), on("t:1.4").
used("t:1.4",neg(ezuyo(z(alazu))),if(c("t:1.4"),o("t:1.4"))) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(P,o("t:1.4")), holds(neg(P)), on("t:1.4").
used("t:1.4",neg(ezuyo(z(alazu))),neg(P)) :- holds(if(c("t:1.4"),o("t:1.4"))), fits(P,o("t:1.4")), holds(neg(P)), on("t:1.4").
% t:1.5
on("t:1.5").
holds(if(c("t:1.5"),o("t:1.5"))) :- on("t:1.5").
fired("t:1.5",if(c("t:1.5"),o("t:1.5"))) :- on("t:1.5").
holds(against(if(c("t:1.5"),o("t:1.5")),plan(sp("a")))) :- on("t:1.5").
fired("t:1.5",against(if(c("t:1.5"),o("t:1.5")),plan(sp("a")))) :- on("t:1.5").
holds(owuro(z(azozo))) :- holds(if(c("t:1.5"),o("t:1.5"))), fits(c("t:1.5"),P), holds(P), on("t:1.5").
fired("t:1.5",owuro(z(azozo))) :- holds(if(c("t:1.5"),o("t:1.5"))), fits(c("t:1.5"),P), holds(P), on("t:1.5").
used("t:1.5",owuro(z(azozo)),if(c("t:1.5"),o("t:1.5"))) :- holds(if(c("t:1.5"),o("t:1.5"))), fits(c("t:1.5"),P), holds(P), on("t:1.5").
used("t:1.5",owuro(z(azozo)),P) :- holds(if(c("t:1.5"),o("t:1.5"))), fits(c("t:1.5"),P), holds(P), on("t:1.5").
holds(neg(ezuyo(z(alazu)))) :- holds(if(c("t:1.5"),o("t:1.5"))), fits(P,o("t:1.5")), holds(neg(P)), on("t:1.5").
fired("t:1.5",neg(ezuyo(z(alazu)))) :- holds(if(c("t:1.5"),o("t:1.5"))), fits(P,o("t:1.5")), holds(neg(P)), on("t:1.5").
used("t:1.5",neg(ezuyo(z(alazu))),if(c("t:1.5"),o("t:1.5"))) :- holds(if(c("t:1.5"),o("t:1.5"))), fits(P,o("t:1.5")), holds(neg(P)), on("t:1.5").
used("t:1.5",neg(ezuyo(z(alazu))),neg(P)) :- holds(if(c("t:1.5"),o("t:1.5"))), fits(P,o("t:1.5")), holds(neg(P)), on("t:1.5").
% t:1.6
on("t:1.6").
via("t:1.6",clues) :- on("t:1.6").
fired("t:1.6",via("t:1.6",clues)) :- on("t:1.6").
holds(view(azozo,uduru(z(alazu)))) :- on("t:1.6").
fired("t:1.6",view(azozo,uduru(z(alazu)))) :- on("t:1.6").
holds(view(azozo,erula)) :- on("t:1.6").
fired("t:1.6",view(azozo,erula)) :- on("t:1.6").
holds(view(azozo,cause(erula,uduru(z(alazu))))) :- on("t:1.6").
fired("t:1.6",view(azozo,cause(erula,uduru(z(alazu))))) :- on("t:1.6").
% t:1.7
on("t:1.7").
via("t:1.7",clues) :- on("t:1.7").
fired("t:1.7",via("t:1.7",clues)) :- on("t:1.7").
holds(view(azozo,neg(uduru(z(alazu))))) :- on("t:1.7").
fired("t:1.7",view(azozo,neg(uduru(z(alazu))))) :- on("t:1.7").

% Fits, from match().
fits(c("t:0.7"),ezuve(z(alazu))).
fits(ezuve(z(alazu)),c("t:0.7")).
fits(o("t:0.7"),owuro(z(azozo))).
fits(owuro(z(azozo)),o("t:0.7")).
fits(c("t:0.14"),isa(nm("t:0.13",bl),ugala)).
fits(isa(nm("t:0.13",bl),ugala),c("t:0.14")).
fits(c("t:0.14"),isa(nm("t:0.14",bl),ugala)).
fits(isa(nm("t:0.14",bl),ugala),c("t:0.14")).
fits(c("t:0.14"),isa(nm("t:0.17",bl),ugala)).
fits(isa(nm("t:0.17",bl),ugala),c("t:0.14")).
fits(c("t:0.14"),ugala).
fits(ugala,c("t:0.14")).
fits(o("t:0.14"),isa(nm("t:0.13",z),erula)).
fits(isa(nm("t:0.13",z),erula),o("t:0.14")).
fits(o("t:0.14"),isa(nm("t:0.14",z),erula)).
fits(isa(nm("t:0.14",z),erula),o("t:0.14")).
fits(o("t:0.14"),erula).
fits(erula,o("t:0.14")).
fits(o("t:0.14"),isa(nm("t:0.17",z),erula)).
fits(isa(nm("t:0.17",z),erula),o("t:0.14")).
fits(c("t:0.15"),ezalo).
fits(ezalo,c("t:0.15")).
fits(o("t:0.15"),ayebe(z(ahela),d(evela))).
fits(ayebe(z(ahela),d(evela)),o("t:0.15")).
fits(c("t:0.17"),isa(nm("t:0.13",bl),ugala)).
fits(isa(nm("t:0.13",bl),ugala),c("t:0.17")).
fits(c("t:0.17"),isa(nm("t:0.14",bl),ugala)).
fits(isa(nm("t:0.14",bl),ugala),c("t:0.17")).
fits(c("t:0.17"),isa(nm("t:0.17",bl),ugala)).
fits(isa(nm("t:0.17",bl),ugala),c("t:0.17")).
fits(c("t:0.17"),ugala).
fits(ugala,c("t:0.17")).
fits(o("t:0.17"),isa(nm("t:0.13",z),erula)).
fits(isa(nm("t:0.13",z),erula),o("t:0.17")).
fits(o("t:0.17"),isa(nm("t:0.14",z),erula)).
fits(isa(nm("t:0.14",z),erula),o("t:0.17")).
fits(o("t:0.17"),erula).
fits(erula,o("t:0.17")).
fits(o("t:0.17"),isa(nm("t:0.17",z),erula)).
fits(isa(nm("t:0.17",z),erula),o("t:0.17")).
fits(i("t:0.29",1),isa(nm("t:0.13",z),erula)).
fits(isa(nm("t:0.13",z),erula),i("t:0.29",1)).
fits(i("t:0.29",1),isa(nm("t:0.14",z),erula)).
fits(isa(nm("t:0.14",z),erula),i("t:0.29",1)).
fits(i("t:0.29",1),erula).
fits(erula,i("t:0.29",1)).
fits(i("t:0.29",1),isa(nm("t:0.17",z),erula)).
fits(isa(nm("t:0.17",z),erula),i("t:0.29",1)).
fits(i("t:0.29",2),isa(nm("t:0.13",bl),ugala)).
fits(isa(nm("t:0.13",bl),ugala),i("t:0.29",2)).
fits(i("t:0.29",2),isa(nm("t:0.14",bl),ugala)).
fits(isa(nm("t:0.14",bl),ugala),i("t:0.29",2)).
fits(i("t:0.29",2),isa(nm("t:0.17",bl),ugala)).
fits(isa(nm("t:0.17",bl),ugala),i("t:0.29",2)).
fits(i("t:0.29",2),ugala).
fits(ugala,i("t:0.29",2)).
fits(c("t:1.4"),ezuyo(z(alazu))).
fits(ezuyo(z(alazu)),c("t:1.4")).
fits(o("t:1.4"),owuro(z(azozo))).
fits(owuro(z(azozo)),o("t:1.4")).
fits(c("t:1.5"),ezuyo(z(alazu))).
fits(ezuyo(z(alazu)),c("t:1.5")).
fits(o("t:1.5"),owuro(z(azozo))).
fits(owuro(z(azozo)),o("t:1.5")).
fits(if(c("t:1.4"),o("t:1.4")),if(c("t:1.5"),o("t:1.5"))).
fits(if(c("t:1.5"),o("t:1.5")),if(c("t:1.4"),o("t:1.4"))).
