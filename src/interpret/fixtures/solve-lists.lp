% t:0.0 = l1
% t:0.1 = l2
% t:0.2 = l3
% t:0.3 = l4
% t:0.4 = r1
% t:0.5 = r2
% t:0.6 = r3
% t:0.7 = r4
% t:0.8 = r5
% t:0.9 = r6
% t:0.10 = r7
% t:0.11 = r8
% t:0.12 = r9
% t:0.13 = r10
% t:0.14 = r11
% t:0.15 = r12
% t:0.16 = l7
% t:0.17 = l8
% t:0.18 = l9
% t:0.19 = l10

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
holds(owuro(z(ls("t:0.0",z)))) :- on("t:0.0").
fired("t:0.0",owuro(z(ls("t:0.0",z)))) :- on("t:0.0").
holds(owuro(z(X))) :- member(ls("t:0.0",z),X,G), on("t:0.0").
fired("t:0.0",owuro(z(X))) :- member(ls("t:0.0",z),X,G), on("t:0.0").
% t:0.1
on("t:0.1").
holds(ayebe(z(ls("t:0.1",z)),d(ls("t:0.1",d)))) :- on("t:0.1").
fired("t:0.1",ayebe(z(ls("t:0.1",z)),d(ls("t:0.1",d)))) :- on("t:0.1").
holds(isa(nm("t:0.1",d1),ogoze)) :- on("t:0.1").
fired("t:0.1",isa(nm("t:0.1",d1),ogoze)) :- on("t:0.1").
holds(isa(nm("t:0.1",d2),odoze)) :- on("t:0.1").
fired("t:0.1",isa(nm("t:0.1",d2),odoze)) :- on("t:0.1").
holds(ayebe(z(X1),d(X2))) :- member(ls("t:0.1",z),X1,G), member(ls("t:0.1",d),X2,G), on("t:0.1").
fired("t:0.1",ayebe(z(X1),d(X2))) :- member(ls("t:0.1",z),X1,G), member(ls("t:0.1",d),X2,G), on("t:0.1").
% t:0.2
on("t:0.2").
holds(ayebe(z(ls("t:0.2",z)),d(ls("t:0.2",d)))) :- on("t:0.2").
fired("t:0.2",ayebe(z(ls("t:0.2",z)),d(ls("t:0.2",d)))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(ehohe(z(ls("t:0.3",z)))) :- on("t:0.3").
fired("t:0.3",ehohe(z(ls("t:0.3",z)))) :- on("t:0.3").
% t:0.4
on("t:0.4").
holds(most(dt("slot:adj","guzemel"),ahela)) :- on("t:0.4").
fired("t:0.4",most(dt("slot:adj","guzemel"),ahela)) :- on("t:0.4").
% t:0.5
on("t:0.5").
holds(tie(dt("slot:adj","gamahum"),azozo,alazu,l)) :- on("t:0.5").
fired("t:0.5",tie(dt("slot:adj","gamahum"),azozo,alazu,l)) :- on("t:0.5").
holds(tie(dt("slot:adj","gamahum"),alazu,azozo,l)) :- on("t:0.5").
fired("t:0.5",tie(dt("slot:adj","gamahum"),alazu,azozo,l)) :- on("t:0.5").
% t:0.6
on("t:0.6").
holds(more(dt("slot:adj","gamahum"),azozo,alazu)) :- on("t:0.6").
fired("t:0.6",more(dt("slot:adj","gamahum"),azozo,alazu)) :- on("t:0.6").
% t:0.7
on("t:0.7").
holds(tie(dt("slot:adj","gamahum"),azozo,alazu,m)) :- on("t:0.7").
fired("t:0.7",tie(dt("slot:adj","gamahum"),azozo,alazu,m)) :- on("t:0.7").
holds(tie(dt("slot:adj","gamahum"),alazu,azozo,m)) :- on("t:0.7").
fired("t:0.7",tie(dt("slot:adj","gamahum"),alazu,azozo,m)) :- on("t:0.7").
% t:0.8
on("t:0.8").
holds(owuro(z(ls("t:0.8",z)))) :- on("t:0.8").
fired("t:0.8",owuro(z(ls("t:0.8",z)))) :- on("t:0.8").
holds(tie(dt("unit:h","hahunom"),azozo,alazu,l)) :- on("t:0.8").
fired("t:0.8",tie(dt("unit:h","hahunom"),azozo,alazu,l)) :- on("t:0.8").
holds(tie(dt("unit:h","hahunom"),alazu,azozo,l)) :- on("t:0.8").
fired("t:0.8",tie(dt("unit:h","hahunom"),alazu,azozo,l)) :- on("t:0.8").
holds(owuro(z(X))) :- member(ls("t:0.8",z),X,G), on("t:0.8").
fired("t:0.8",owuro(z(X))) :- member(ls("t:0.8",z),X,G), on("t:0.8").
% t:0.9
on("t:0.9").
holds(tie(dt("slot:adj","gamahum"),azozo,alazu,l)) :- on("t:0.9").
fired("t:0.9",tie(dt("slot:adj","gamahum"),azozo,alazu,l)) :- on("t:0.9").
holds(tie(dt("slot:adj","gamahum"),azozo,ahela,l)) :- on("t:0.9").
fired("t:0.9",tie(dt("slot:adj","gamahum"),azozo,ahela,l)) :- on("t:0.9").
holds(tie(dt("slot:adj","gamahum"),alazu,azozo,l)) :- on("t:0.9").
fired("t:0.9",tie(dt("slot:adj","gamahum"),alazu,azozo,l)) :- on("t:0.9").
holds(tie(dt("slot:adj","gamahum"),alazu,ahela,l)) :- on("t:0.9").
fired("t:0.9",tie(dt("slot:adj","gamahum"),alazu,ahela,l)) :- on("t:0.9").
holds(tie(dt("slot:adj","gamahum"),ahela,azozo,l)) :- on("t:0.9").
fired("t:0.9",tie(dt("slot:adj","gamahum"),ahela,azozo,l)) :- on("t:0.9").
holds(tie(dt("slot:adj","gamahum"),ahela,alazu,l)) :- on("t:0.9").
fired("t:0.9",tie(dt("slot:adj","gamahum"),ahela,alazu,l)) :- on("t:0.9").
% t:0.10
on("t:0.10").
holds(more(dt("slot:adj","gamahum"),alazu,azozo)) :- on("t:0.10").
fired("t:0.10",more(dt("slot:adj","gamahum"),alazu,azozo)) :- on("t:0.10").
% t:0.11
on("t:0.11").
holds(elune(z(ls("t:0.11",z)))) :- on("t:0.11").
fired("t:0.11",elune(z(ls("t:0.11",z)))) :- on("t:0.11").
holds(more(dt("unit:h","hahunom"),azozo,ahela)) :- on("t:0.11").
fired("t:0.11",more(dt("unit:h","hahunom"),azozo,ahela)) :- on("t:0.11").
holds(elune(z(X))) :- member(ls("t:0.11",z),X,G), on("t:0.11").
fired("t:0.11",elune(z(X))) :- member(ls("t:0.11",z),X,G), on("t:0.11").
% t:0.12
on("t:0.12").
holds(more(dt("slot:adj","gamahum"),azozo,alazu)) :- on("t:0.12").
fired("t:0.12",more(dt("slot:adj","gamahum"),azozo,alazu)) :- on("t:0.12").
holds(more(dt("slot:adj","gamahum"),azozo,ahela)) :- on("t:0.12").
fired("t:0.12",more(dt("slot:adj","gamahum"),azozo,ahela)) :- on("t:0.12").
holds(more(dt("slot:adj","gamahum"),alazu,ahela)) :- on("t:0.12").
fired("t:0.12",more(dt("slot:adj","gamahum"),alazu,ahela)) :- on("t:0.12").
% t:0.13
on("t:0.13").
holds(more(dt("slot:adj","gamahum"),alazu,azozo)) :- on("t:0.13").
fired("t:0.13",more(dt("slot:adj","gamahum"),alazu,azozo)) :- on("t:0.13").
holds(more(dt("slot:adj","gamahum"),ahela,azozo)) :- on("t:0.13").
fired("t:0.13",more(dt("slot:adj","gamahum"),ahela,azozo)) :- on("t:0.13").
holds(more(dt("slot:adj","gamahum"),ahela,alazu)) :- on("t:0.13").
fired("t:0.13",more(dt("slot:adj","gamahum"),ahela,alazu)) :- on("t:0.13").
% t:0.14
on("t:0.14").
holds(ratio(dt("slot:adj","gelazem"),azozo,alazu,v(2))) :- on("t:0.14").
fired("t:0.14",ratio(dt("slot:adj","gelazem"),azozo,alazu,v(2))) :- on("t:0.14").
% t:0.15
on("t:0.15").
holds(ratio(dt("slot:adj","gelazem"),azozo,alazu,v(2))) :- on("t:0.15").
fired("t:0.15",ratio(dt("slot:adj","gelazem"),azozo,alazu,v(2))) :- on("t:0.15").
% t:0.16
on("t:0.16").
holds(neg(ageda(z(alazu),d(obode)))) :- on("t:0.16").
fired("t:0.16",neg(ageda(z(alazu),d(obode)))) :- on("t:0.16").
% t:0.17
on("t:0.17").
holds(neg(ayebe(z(azozo),d(odoze)))) :- on("t:0.17").
fired("t:0.17",neg(ayebe(z(azozo),d(odoze)))) :- on("t:0.17").
holds(neg(ayebe(z(azozo),d(ogoze)))) :- on("t:0.17").
fired("t:0.17",neg(ayebe(z(azozo),d(ogoze)))) :- on("t:0.17").
holds(neg(ayebe(z(alazu),d(odoze)))) :- on("t:0.17").
fired("t:0.17",neg(ayebe(z(alazu),d(odoze)))) :- on("t:0.17").
holds(neg(ayebe(z(alazu),d(ogoze)))) :- on("t:0.17").
fired("t:0.17",neg(ayebe(z(alazu),d(ogoze)))) :- on("t:0.17").
% t:0.18
on("t:0.18").
holds(owuro(z(ls("t:0.18",z)))) :- on("t:0.18").
fired("t:0.18",owuro(z(ls("t:0.18",z)))) :- on("t:0.18").
holds(isa(nm("t:0.18",z1),odoze)) :- on("t:0.18").
fired("t:0.18",isa(nm("t:0.18",z1),odoze)) :- on("t:0.18").
detail(nm("t:0.18",z1),dt("hookJob:genitive","om",ahela,w)) :- on("t:0.18").
fired("t:0.18",detail(nm("t:0.18",z1),dt("hookJob:genitive","om",ahela,w))) :- on("t:0.18").
holds(isa(nm("t:0.18",z2),ogoze)) :- on("t:0.18").
fired("t:0.18",isa(nm("t:0.18",z2),ogoze)) :- on("t:0.18").
detail(nm("t:0.18",z2),dt("hookJob:genitive","om",ahela,w)) :- on("t:0.18").
fired("t:0.18",detail(nm("t:0.18",z2),dt("hookJob:genitive","om",ahela,w))) :- on("t:0.18").
holds(owuro(z(X))) :- member(ls("t:0.18",z),X,G), on("t:0.18").
fired("t:0.18",owuro(z(X))) :- member(ls("t:0.18",z),X,G), on("t:0.18").
% t:0.19
on("t:0.19").
holds(isa(ls("t:0.19",z),arole)) :- on("t:0.19").
fired("t:0.19",isa(ls("t:0.19",z),arole)) :- on("t:0.19").

% Fits, from match().
fits(ayebe(z(azozo),d(ogoze)),ayebe(z(azozo),d(nm("t:0.1",d1)))).
fits(ayebe(z(alazu),d(odoze)),ayebe(z(alazu),d(nm("t:0.1",d2)))).

% Members, from claimMemberLists().
member(ls("t:0.0",z),azozo,1).
member(ls("t:0.0",z),alazu,2).
member(ls("t:0.1",z),azozo,1).
member(ls("t:0.1",z),alazu,2).
member(ls("t:0.1",d),nm("t:0.1",d1),1).
member(ls("t:0.1",d),nm("t:0.1",d2),2).
member(ls("t:0.8",z),azozo,1).
member(ls("t:0.8",z),alazu,2).
member(ls("t:0.11",z),azozo,1).
member(ls("t:0.11",z),ahela,2).
member(ls("t:0.18",z),nm("t:0.18",z1),1).
member(ls("t:0.18",z),nm("t:0.18",z2),2).

% Number order, from compareValues().
less(v(-2),v(2)).
