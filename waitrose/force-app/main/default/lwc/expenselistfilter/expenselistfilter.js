import { LightningElement, track, wire } from 'lwc';
import getFilteredExpenses from '@salesforce/apex/ExpenseFilterController.getFilteredExpenses';
import getExpenseTypePicklistValues from '@salesforce/apex/ExpenseController.getExpenseTypePicklistValues';
import { publish, MessageContext } from 'lightning/messageService';
import EXPENSE_STATUS_CHANGE_EVENT from '@salesforce/messageChannel/ExpenseStatusChangeEvent__c'; 

export default class ExpenseList extends LightningElement {
    @track expenseType = '';
    @track startDate;
    @track endDate;
    @track expenses = [];
    @track isModalOpen = false;
    @track selectedExpenseId;
    @track expenseTypeOptions = [];

    // Define the columns for the datatable
    columns = [
        { label: 'Expense Type', fieldName: 'Expense_Type__c' },
        { label: 'Amount', fieldName: 'Amount__c' },
        { label: 'Description', fieldName: 'Description__c' },
        { label: 'Date', fieldName: 'Expense_Date__c' },
        { label: 'Status', fieldName: 'Expense_status__c' },
        {
            label: 'Actions',
            type: 'button',
            typeAttributes: { label: 'Approve/Reject', name: 'approve_reject', variant: 'brand' }
        }
    ];

    // Fetch Expense Type picklist values from Apex
    @wire(getExpenseTypePicklistValues)
    wiredExpenseTypeOptions({ error, data }) {
        if (data) {
            this.expenseTypeOptions = data.map(value => ({
                label: value,
                value: value
            }));
        } else if (error) {
            console.error('Error fetching Expense Type picklist values:', error);
        }
    }

     // Inject the message context to allow subscription
     @wire(MessageContext)
     messageContext;
 
    // Handle row action (approve/reject)
    handleRowAction(event) {
        const row = event.detail.row;
        this.selectedExpenseId = row.Id;  // Get selected Expense Id
        this.isModalOpen = true;  // Open the modal
    }

    // Close the modal
    closeModal() {
        this.isModalOpen = false;
    }
  // Publish the event when an expense is approved or rejected
  publishExpenseStatusChange(status, expenseId, comment) {
    const message = {
        ExpenseId__c: expenseId,
        Status__c: status,
        Comment__c: comment
    };
    console.log('Publishing message: ', message);  // Debugging line
    publish(this.messageContext, EXPENSE_STATUS_CHANGE_EVENT, message);
}

    // Method to handle approval of expense
    handleApproveExpense() {
    console.log('Approve Expense clicked');
    this.publishExpenseStatusChange('Approved', this.selectedExpenseId, 'Expense has been approved.');
    this.closeModal();  // Close the modal after approval
}

    // Method to handle rejection of expense
    handleRejectExpense() {
    console.log('Reject Expense clicked');
    this.publishExpenseStatusChange('Rejected', this.selectedExpenseId, 'Expense has been rejected.');
    this.closeModal();  // Close the modal after rejection
}
    // Fetch filtered expenses manually when the Search button is clicked
    handleSearchClick() {
        getFilteredExpenses({
            expenseType: this.expenseType,
            startDate: this.startDate,
            endDate: this.endDate
        })
        .then(result => {
            this.expenses = result;
        })
        .catch(error => {
            console.error('Error fetching expenses', error);
        });
    }

    // Handlers for filter inputs
    handleExpenseTypeChange(event) {
        this.expenseType = event.target.value;
    }

    handleStartDateChange(event) {
        this.startDate = event.target.value ? new Date(event.target.value) : null;
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value ? new Date(event.target.value) : null;
    }

    // Reset all filters
    handleResetFilters() {
        this.expenseType = '';
        this.startDate = null;
        this.endDate = null;
    }
}
