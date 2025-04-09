import { LightningElement, api, track , wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import approveExpense from '@salesforce/apex/ExpenseApprovalHandler.approveExpense';
import rejectExpense from '@salesforce/apex/ExpenseApprovalHandler.rejectExpense';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = ['Expense__c.Expense_Type__c', 'Expense__c.Amount__c', 'Expense__c.Description__c', 'Expense__c.Expense_status__c'];

export default class ExpenseApproval extends LightningElement {
    @api expenseId;
    @track comment = '';

    @wire(getRecord, { recordId: '$expenseId', fields: FIELDS })
    expense;

    handleApprove() {
        approveExpense({ expenseId: this.expenseId, comment: this.comment })
            .then(() => {
                this.showToast('Success', 'Expense Approved successfully!', 'success');
                this.dispatchEvent(new CustomEvent('close'));
            })
            .catch(error => {
                this.showToast('Error', error.body.message || 'There was an issue approving the expense.', 'error');
            });
    }

    handleReject() {
        rejectExpense({ expenseId: this.expenseId, comment: this.comment })
            .then(() => {
                this.showToast('Success', 'Expense Rejected successfully!', 'success');
                this.dispatchEvent(new CustomEvent('close'));
            })
            .catch(error => {
                this.showToast('Error', error.body.message || 'There was an issue rejecting the expense.', 'error');
            });
    }

    handleCommentChange(event) {
        this.comment = event.target.value;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
