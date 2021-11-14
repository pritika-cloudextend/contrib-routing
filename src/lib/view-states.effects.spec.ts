import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { provideMockActions } from "@ngrx/effects/testing";
import { Action } from "@ngrx/store";
import { Observable, of } from "rxjs";

import { navigate } from "./navigation";
import { ViewStateEffects } from "./view-states.effects";

describe("View State Effects", () => {
    let effects: ViewStateEffects;
    let actions$: Observable<Action>;
    let navFn: jest.Mock;

    beforeEach(() => {
        const router = { navigate: jest.fn() } as unknown as Router;
        navFn = (router.navigate as jest.Mock).mockReturnValue(
            Promise.resolve(true)
        );

        TestBed.configureTestingModule({
            providers: [
                provideMockActions(() => actions$),
                { provide: Router, useValue: router },
                ViewStateEffects,
            ],
        });

        effects = TestBed.inject(ViewStateEffects);
    });

    describe("On transition events", () => {
        it("can navigate to a static route", done => {
            actions$ = of(
                navigate("UNIT TEST", { pathSegments: ["unit/test"] })
            );
            effects.navigateOnEvent$.subscribe({
                next: () => {
                    expect(navFn).toHaveBeenCalledTimes(1);
                    const recievedUrlSegments = navFn.mock.calls[0]
                        .args[0] as unknown[];
                    expect(recievedUrlSegments?.length).toEqual(1);
                    expect(recievedUrlSegments[0]).toEqual("unit/test");
                    done();
                },
                error: done.fail,
            });
        });

        it("can navigate to a route with parameters", done => {
            actions$ = of(
                navigate("UNIT TEST", {
                    pathSegments: ["unit/test", "param", "non-param"],
                    params: { param: "blah" },
                })
            );
            effects.navigateOnEvent$.subscribe({
                next: () => {
                    expect(navFn).toHaveBeenCalledTimes(1);
                    const recievedUrlSegments = navFn.mock.calls[0]
                        .args[0] as unknown[];
                    expect(recievedUrlSegments?.length).toEqual(3);
                    expect(recievedUrlSegments[0]).toEqual("unit/test");
                    expect(recievedUrlSegments[1]).toEqual("blah");
                    expect(recievedUrlSegments[2]).toEqual("non-param");

                    done();
                },
                error: done.fail,
            });
        });
    });
});