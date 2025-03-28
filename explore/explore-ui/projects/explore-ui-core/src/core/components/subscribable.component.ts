import {Directive, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';

/**
 * This class is a simple abstract class to encapsulate the unsubscribe for a subscription.
 * It gives access to the ngUnsubscribe to use in a takeUntil statement.
 *
 * NOTE:  This class has ngOnDestroy so override onDestroy if you need a destroy in the child component.
 */
@Directive()
export abstract class SubscribableComponent implements OnDestroy {
    protected ngUnsubscribe: Subject<void> = new Subject();

    /**
     * Trigger the destroy of the subscriptions.
     */
    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();

        this.onDestroy();
    }

    /**
     * Method called to allow the caller to destroy any resources.
     */
    protected onDestroy() {
        // Intentionally blank, but here so derived classes can override.
    }
}
