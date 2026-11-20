% t:0.0 = n1
% t:0.1 = n2
% t:0.2 = n3
% t:0.3 = n4
% t:0.4 = n5
% t:0.5 = n6
% t:0.6 = n7

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
holds(isa(nm("t:0.0",d),odoze)) :- on("t:0.0").
fired("t:0.0",isa(nm("t:0.0",d),odoze)) :- on("t:0.0").
count(nm("t:0.0",d),v(3)) :- on("t:0.0").
fired("t:0.0",count(nm("t:0.0",d),v(3))) :- on("t:0.0").
holds(ayebe(z(azozo),d(nm("t:0.0",d)))) :- on("t:0.0").
fired("t:0.0",ayebe(z(azozo),d(nm("t:0.0",d)))) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(isa(nm("t:0.1",d),odoze)) :- on("t:0.1").
fired("t:0.1",isa(nm("t:0.1",d),odoze)) :- on("t:0.1").
count(nm("t:0.1",d),v(5)) :- on("t:0.1").
fired("t:0.1",count(nm("t:0.1",d),v(5))) :- on("t:0.1").
holds(ayebe(z(alazu),d(nm("t:0.1",d)))) :- on("t:0.1").
fired("t:0.1",ayebe(z(alazu),d(nm("t:0.1",d)))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(isa(nm("t:0.2",d),odoze)) :- on("t:0.2").
fired("t:0.2",isa(nm("t:0.2",d),odoze)) :- on("t:0.2").
count(nm("t:0.2",d),rng(v(3),v(5),oel)) :- on("t:0.2").
fired("t:0.2",count(nm("t:0.2",d),rng(v(3),v(5),oel))) :- on("t:0.2").
holds(ayebe(z(ahela),d(nm("t:0.2",d)))) :- on("t:0.2").
fired("t:0.2",ayebe(z(ahela),d(nm("t:0.2",d)))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(isa(nm("t:0.3",d),odoze)) :- on("t:0.3").
fired("t:0.3",isa(nm("t:0.3",d),odoze)) :- on("t:0.3").
count(nm("t:0.3",d),rng(inf,v(3),uel)) :- on("t:0.3").
fired("t:0.3",count(nm("t:0.3",d),rng(inf,v(3),uel))) :- on("t:0.3").
holds(ayebe(z(alazu),d(nm("t:0.3",d)))) :- on("t:0.3").
fired("t:0.3",ayebe(z(alazu),d(nm("t:0.3",d)))) :- on("t:0.3").
% t:0.4
on("t:0.4").
holds(isa(nm("t:0.4",d),ogoze)) :- on("t:0.4").
fired("t:0.4",isa(nm("t:0.4",d),ogoze)) :- on("t:0.4").
holds(ayebe(z(alazu),d(nm("t:0.4",d)))) :- on("t:0.4").
fired("t:0.4",ayebe(z(alazu),d(nm("t:0.4",d)))) :- on("t:0.4").
% t:0.5
on("t:0.5").
holds(isa(nm("t:0.5",d),odoze)) :- on("t:0.5").
fired("t:0.5",isa(nm("t:0.5",d),odoze)) :- on("t:0.5").
holds(ayebe(z(ahela),d(nm("t:0.5",d)))) :- on("t:0.5").
fired("t:0.5",ayebe(z(ahela),d(nm("t:0.5",d)))) :- on("t:0.5").
% t:0.6
on("t:0.6").
holds(more(dt("lexReading:number",w("gral")),ogoze,odoze)) :- on("t:0.6").
fired("t:0.6",more(dt("lexReading:number",w("gral")),ogoze,odoze)) :- on("t:0.6").

% Number order, from compareValues().
less(v(3),v(5)).
within(v(3),rng(v(3),v(5),oel)).
within(v(5),rng(v(3),v(5),oel)).
within(v(5),rng(inf,v(3),uel)).
