import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext, unsubscribe } from 'lightning/messageService';
import EXPENSE_STATUS_CHANGE_EVENT from '@salesforce/messageChannel/ExpenseStatusChangeEvent__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ExpenseNotification extends LightningElement {
    message; // Variable to store the message data
    subscription = null; // Variable to store the subscription

    // Inject the message context to allow subscription
    @wire(MessageContext)
    messageContext;

    // Subscribe to the message channel when the component is connected
    connectedCallback() {
        console.log('Subscribing to message channel...');
        this.subscription = subscribe(
            this.messageContext,
            EXPENSE_STATUS_CHANGE_EVENT,
            (message) => this.handleMessage(message)
        );
    }

    // Unsubscribe from the message channel when the component is disconnected
    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = null;
        }
    }

    // Handle the incoming message
    handleMessage(message) {
        console.log('Message received: ', message);  // Check if the message is being received
        if (message.Status__c && message.ExpenseId__c) {
            this.showToast(message);
        } else {
            console.error('Invalid message received: ', message);
        }
    }

    // Show toast notification
    showToast(message) {
        // Determine the toast variant based on the status
        const variant = message.Status__c === 'Approved' ? 'success' : message.Status__c === 'Rejected' ? 'error' : 'info';
        
        const evt = new ShowToastEvent({
            title: `Expense Status: ${message.Status__c}`,
            message: `Expense with ID ${message.ExpenseId__c} has been ${message.Status__c}. Comment: ${message.Comment__c}`,
            variant: variant,
        });
        this.dispatchEvent(evt);  // Dispatch the toast event to display the notification
    }
}
