class Constants {

    static SYSTEM_LISTS: string[] = [
        "Composed Looks",
        "Master Page Gallery",
        "Documents",
        "Images",
        "Pages",
        "Site Assets",
        "Site Pages",
        "Workflow Tasks",
        "Microfeed",
        "MicroFeed",
        "Access Requests",
    ];

    // ------------------------------ TEXT VALUE ------------------------------
    static DOCUMENT_TYPE = {
        RnD: "RnD",
        LL: "LL",
        Thesis: "Thesis",
        Paper: "Paper"
    };
    static DOCUMENT_TYPE_LONGNAME = {
        RnD: "Research and Development",
        LL: "Lessons Learned",
        Thesis: "Thesis",
        Paper: "Paper"
    }
    static SECURITY_CLASS_SHORT_NAME = {
        SC1: "SC1",
        SC2: "SC2",
        SC3: "SC3",
    };
    static SECURITY_CLASS_POSTFIX = {
        SC1: "-SC1",
        SC2: "-SC2",
        SC3: "-SC3",
    };
    static SECURITY_CLASS_LONG_NAME = {
        SC1: "1 Internal",
        SC2: "2 Confidential",
        SC3: "3 Strictly Confidential",
    };
    static PERMISSIONS = {
        ADMIN: "Admin",
        SUPER_ADMIN: "SuperAdmin",
        RND_DIVISION_ADMIN: "RnDDivisionAdmin",
        LL_DIVISION_ADMIN: "LLDivisionAdmin",
        LL_ADMIN: "LLAdmin",
        THESIS_ADMIN: "ThesisAdmin",
        PAPER_ADMIN: "PaperAdmin",
        RND_USER: "RnDUser"
    };
    static TOAST_MESSAGE_CODE = {
        SUCCESS: "success",
        ERROR: "error",
        WARN: "warn",
        INFO: "info"
    };
    // SharePoint groups
    static SP_GROUP = {
        FEBER_SUPER_ADMIN: "FEBER Super Admin",
        FEBER_LL_ADMIN: "FEBER LL Admin",
        FEBER_THESIS_ADMIN: "FEBER Thesis Admin",
        FEBER_PAPER_ADMIN: "FEBER Paper Admin",
    };
    // Statistics
    static STATISTICS: any = {
        DOWNLOAD: "DownloadedStatistics",
        UPLOAD: "UploadedStatistics",
        ORDER: "OrderedStatistics",
        SEARCH: "SearchedStatistics",
        DELETE: "DeletedStatistics"
    };

    static TYPE_MASTER_LIST: any = {
        RnD: "RnDTypeMaster",
        Thesis: "ThesisTypeMaster",
        Paper: "PaperTypeMaster",
    };

    // ------------------------------ MESSAGES ------------------------------
    static PREFIX_MESSAGE = {
        SOMETHING_WENT_WRONG_WHILE: "Something went wrong while "
    };
    static POSTFIX_MESSAGE = {
        CREATE: {
            SUCCESS: " is created successfully.",
            FAILED: " is not created.",
            EXISTED: " has already existed."
        },
        UPDATE: {
            SUCCESS: " is updated successfully.",
            FAILED: " is not updated."
        },
        REMOVE: {
            SUCCESS: " is removed successfully.",
            FAILED: " is not removed."
        },
        ORDER: {
            SUCCESS: " is ordered successfully.",
            FAILED: " is not ordered."
        },
        EXPORT: {
            SUCCESS: " is exported successfully.",
            FAILED: " is not exported."
        },
        RESTART: {
            SUCCESS: " is restarted successfully.",
            FAILED: " is not restarted."
        },
        TRY_AGAIN: " Please try again.",
        PROCEED: " Would you like to proceed?"
    };
    static GENERAL_ERROR_MESSAGE = {
        RETRIEVE_DEPARTMENTS: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "retrieving the departments.",
        DEPARTMENT_NOT_BELONG_TO_DIVISON: "The target department does not belong to your division."
    }
    // Subscription
    static SUBSCRIPTION_MESSAGE = {
        CREATE: {
            SUCCESS: "The subscription for keyword \"{0}\"" + Constants.POSTFIX_MESSAGE.CREATE.SUCCESS,
            FAILED: "The subscription for keyword \"{0}\"" + Constants.POSTFIX_MESSAGE.CREATE.FAILED,
            EXISTED: "You have already added the subscription for keyword \"{0}\"."
        },
        REMOVE: {
            SUCCESS: "The subscription for keyword \"{0}\"" + Constants.POSTFIX_MESSAGE.REMOVE.SUCCESS,
            FAILED: "The subscription for keyword \"{0}\"" + Constants.POSTFIX_MESSAGE.REMOVE.FAILED
        }
    };
    // Bookmark
    static BOOKMARK_MESSAGE = {
        CREATE: {
            SUCCESS: "The report \"{0}\" is bookmarked successfully.",
            FAILED: "The report \"{0}\" is not bookmarked."
        },
        REMOVE: {
            SUCCESS: "The bookmark for report \"{0}\"" + Constants.POSTFIX_MESSAGE.REMOVE.SUCCESS,
            FAILED: "The bookmark for report \"{0}\"" + Constants.POSTFIX_MESSAGE.REMOVE.FAILED
        }
    };
    static STATISTIC_REPORT = {
        INVALID_DATE: "The [From] date must be less than the [To] date.",
        EXPORT_SUCCESS: "The report is successfully generated.",
        EXPORT_FAILED: "The report is not generated."
    };
    // AIM report
    static SEND_AIM_REPORT_MESSAGE = {
        SUCCESS: "The AIM emails are sent successfully.",
        FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "sending AIM emails."
    };
    // Clean up
    static CLEAN_UP_DEPARTMENTS_MESSAGE = {
        CANNOT_COUNT_EMPTY_LISTS: "Cannot count the number of empty lists.",
        SUCCESS: "Empty lists are removed successfully.",
        FAILED: "Empty lists are not removed."
    };
    // Create department
    static CREATE_DEPARTMENT_MESSAGE = {
        SUCCESS: "The list \"{0}\"" + Constants.POSTFIX_MESSAGE.CREATE.SUCCESS,
        FAILED: "The list \"{0}\"" + Constants.POSTFIX_MESSAGE.CREATE.FAILED,
        EXISTED: "The list \"{0}\"" + Constants.POSTFIX_MESSAGE.CREATE.EXISTED,
        EXISTED_FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "checking whether the list exists."
    };
    // Export departments validation
    static EXPORT_DEPARTMENTS_VALIDATION_MESSAGE = {
        SUCCESS: "The department validation result" + Constants.POSTFIX_MESSAGE.EXPORT.SUCCESS,
        FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "exporting the department validation result."
    };
    // Division management
    static DIVISION_MESSAGE = {
        CREATE: {
            SUCCESS: "Division \"{0}\"" + Constants.POSTFIX_MESSAGE.CREATE.SUCCESS,
            FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "creating division \"{0}\".",
            EXISTED: "Division \"{0}\"" + Constants.POSTFIX_MESSAGE.CREATE.EXISTED + " Please choose other short name or code.",
        },
        REMOVE: {
            SUCCESS: "Division \"{0}\"" + Constants.POSTFIX_MESSAGE.REMOVE.SUCCESS,
            FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "removing division \"{0}\".",
        },
        EXPORT: {
            SUCCESS: "The metadata is successfully exported.",
            FAILED: "The metadata is not exported."
        }
    };
    // Groups management
    static GROUP_MESSAGE = {
        CREATE: {
            SUCCESS: "Group \"{0}\"" + Constants.POSTFIX_MESSAGE.CREATE.SUCCESS,
            FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "creating group \"{0}\".",
            EXISTED: "Group \"{0}\"" + Constants.POSTFIX_MESSAGE.CREATE.EXISTED + " Please choose another group.",
        },
        UPDATE: {
            SUCCESS: "Group \"{0}\"" + Constants.POSTFIX_MESSAGE.UPDATE.SUCCESS,
            FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "updating group \"{0}\"."
        },
        REMOVE: {
            SUCCESS: "Group \"{0}\"" + Constants.POSTFIX_MESSAGE.REMOVE.SUCCESS,
            FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "removing group \"{0}\".",
        }
    };
    // Log management
    static LOG_MESSAGE = {
        CREATE_RULE: {
            SUCCESS: "Rule \"{0}\"" + Constants.POSTFIX_MESSAGE.CREATE.SUCCESS,
            FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "creating rule \"{0}\". Please make sure that the rule name's length is less than 255 characters.",
        },
        UPDATE_RULE: {
            SUCCESS: "Rule \"{0}\"" + Constants.POSTFIX_MESSAGE.UPDATE.SUCCESS,
            FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "updating rule \"{0}\". Please make sure that the rule name's length is less than 255 characters."
        },
        REMOVE_RULE: {
            SUCCESS: "Rule \"{0}\"" + Constants.POSTFIX_MESSAGE.REMOVE.SUCCESS,
            FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "removing rule \"{0}\".",
        }
    };
    // Migration
    static MIGRATION = {
        WARN: "Currently, you cannot edit, move or delete this report"
            + " because this function is being blocked by user {0}."
            + " Please contact him/her to proceed the progress fast.",

        SUCCESS: "The migration is done. Please check the results.",
        FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "migrating. Please check the results.",
        FAILED_AND_TRY_AGAIN: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "migrating." + Constants.POSTFIX_MESSAGE.TRY_AGAIN,

        CREATE_DEPARTMENT_LISTS_FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "creating department lists." + Constants.POSTFIX_MESSAGE.TRY_AGAIN,
        DIFFERENT_DEPARTMENTS: "The source department must be different from the target department.",

        RETRIEVE_SUCCESS: "Retrieve data successfully.",
        RETRIEVE_FAILED: "Cannot retrieve data." + Constants.POSTFIX_MESSAGE.TRY_AGAIN,
        RETRIEVE_NO_DATA: "There is no data to be retrieved.",

        STOPPED_SUCCESS: "All selected items are stopped.",
        STOPPED_FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "stopping the migration." + Constants.POSTFIX_MESSAGE.TRY_AGAIN,

        ACCEPT_SUCCESS: "All selected items are accepted.",
        ACCEPT_FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "accepting reports." + Constants.POSTFIX_MESSAGE.TRY_AGAIN,

        REJECT_SUCCESS: "All selected items are rejected.",
        REJECT_FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "rejecting reports." + Constants.POSTFIX_MESSAGE.TRY_AGAIN,

        ADD_ATTACHMENT_SUCCESS: "Adding attachments is done. Please check the results.",
        ADD_ATTACHMENT_FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "adding attachments. Please check the results.",

        CLEAN_SUCCESS: "All selected items are cleaned.",
        CLEAN_FAILED: Constants.PREFIX_MESSAGE.SOMETHING_WENT_WRONG_WHILE + "cleaning." + Constants.POSTFIX_MESSAGE.TRY_AGAIN,
    };
    // Grant Access
    static GRANT_ACCESS = {
        FAILED: "Cannot grant permissions." + Constants.POSTFIX_MESSAGE.TRY_AGAIN
    }
    // Search
    static SEARCH_MESSAGE = {
        COPY_LINK: "The link for report \"{0}\" is copied into your clipboard. You can paste it anywhere.",
        EXPORT_DATA: {
            SUCCESS: "Exported search data successfully.",
            FAILED: "Cannot export search data." + Constants.POSTFIX_MESSAGE.TRY_AGAIN
        }
    };
    // Report
    static REPORT_MESSAGE = {
        UPLOAD: {
            TITLE: "Upload report",
            SUCCESS_USER: "Report is submitted successfully. Please wait until your submission is approved.",
            SUCCESS_ADMIN: "Report is submitted successfully.",
            FAILED: "An Error has occured. Please retry your request. " +
                "If the problem persists, please drop an email to Mailbox.FEBER@de.bosch.com with " +
                "the following error: {0}"
        },
        ORDER: {
            TITLE: "Order report",
            SUCCESS: "The report \"{0}\"" + Constants.POSTFIX_MESSAGE.ORDER.SUCCESS,
            FAILED: "The report \"{0}\"" + Constants.POSTFIX_MESSAGE.ORDER.FAILED
        },
        RESTART: {
            TITLE: "Restart report",
            SUCCESS: "The report \"{0}\"" + Constants.POSTFIX_MESSAGE.RESTART.SUCCESS,
            FAILED: "The report \"{0}\"" + Constants.POSTFIX_MESSAGE.RESTART.FAILED
        },
        UPDATE: {
            TITLE: "Update report",
            SUCCESS: "The report \"{0}\"" + Constants.POSTFIX_MESSAGE.UPDATE.SUCCESS,
            FAILED: "The report \"{0}\"" + Constants.POSTFIX_MESSAGE.UPDATE.FAILED
        },
        REMOVE: {
            TITLE: "Remove report",
            SUCCESS: "The report \"{0}\"" + Constants.POSTFIX_MESSAGE.REMOVE.SUCCESS,
            FAILED: "The report \"{0}\"" + Constants.POSTFIX_MESSAGE.REMOVE.FAILED
        }
    };
    // Confirmation message
    static CONFIRMATION_MESSAGE = {
        CAUTION: "Caution",
        INVALID_ACTION: "Invalid action",
        NO_PERMISSION: {
            TITLE: "No permission",
            CONTENT: "You do not have permission to access this page."
        },
        INVALID_MULTIPLE_MOVE: "All selected items must have status \"New\" to be {0}.",
        REMOVE_BOOKMARK: {
            TITLE: "Remove bookmark",
            CONTENT: "Are you sure you want to remove the bookmark of report \"{0}\"?"
        },
        CLEAN_UP: "This action should be executed after woking hours because it may affect to the other users."
            + " If you continue, all empty lists from all divisions will be deleted." + Constants.POSTFIX_MESSAGE.PROCEED,
        MOVE_SC3: "If you want to move the report \"{0}\" from {1} to {2}, your page will be redirected." + Constants.POSTFIX_MESSAGE.PROCEED,
        MOVE_REPORT: {
            TITLE: "Move report",
            SUCCESS: "Item was moved successfully! It will be accessible in FEBER in approximately one hour.",
            NOT_FOUND: "The report cannot be found or you do not have permission to move this report.",
            WRONG_LINK: "Something went wrong with your link, please check it again.",
            ERROR: "An error has occured. Please retry your request. If the problem persists, please drop an email to Mailbox.FEBER@de.bosch.com."
        },
        BLOCKED_REPORT: {
            TITLE: "Blocked action",
            CONTENT: "Currently, you cannot move the reports because this function is being blocked by user {0}. Please contact him/her to proceed the progress fast."
        },
        REMOVE_DIVISION: "If you continue this action, these information from division {0} will be removed permanently: "
            + " item from list Division Master,"
            + " related sub-sites"
            + " and related groups.",
        INVALID_NAME_GROUP: "The group name does not contain word \"FEBER\", so it will not be shown in the list groups management. Do you still want to proceed?",
        REMOVE_GROUP: "Are you sure you want to delete the group \"{0}\"?",
        GRANT_ACCESS: {
            TITLE: "Grant access",
            CONTENT: "The authorized associates and organizational units are granted access permission to reports in list \"{0}\"."
        },
        ACCEPT_REPORT: "If you continue this action, the migrated reports will be kept, the old reports will be deleted." + Constants.POSTFIX_MESSAGE.PROCEED,
        REJECT_REPORT: "If you continue this action, the migrated reports will be deleted, the old reports will be kept." + Constants.POSTFIX_MESSAGE.PROCEED,
        DELETE_REPORT: {
            TITLE: "Delete report",
            CONTENT: "Are you sure you want to delete the report \"{0}\"?"
        },
        EXPORT_LESSONS: {
            TITLE: "Export lessons",
            CONTENT: "The report \"{0}\" was exported. Do you want to export it again?"
        },
        SUBSCRIPTION_REMOVE: {
            TITLE: "Remove subscription",
            CONTENT: "Are you sure you want to remove the subscription for keyword \"{0}\"?"
        },
        SUBSCRIPTION_UPDATE: {
            TITLE: "Subscription update",
            CONTENT: "You have already subscribed for 3 searched keywords. Do you want to remove the subscription for keyword \"{0}\" and subscribe keyword \"{1}\"?"
        },
        REMOVE_RULE: "Are you sure you want to remove the rule \"{0}\"",
        NO_ROU: {
            TITLE: "Responsible department",
            CONTENT: "No relavant responsible department found."
        },
        CANCEL_UPLOAD_WARNING:"If you cancel the upload, the previously input data will be lost. Are you sure?",
        NO_GM: {
            TITLE: "Strategic Portfolio Owner",
            CONTENT: "No relavant Strategic Portfolio Owner found."
        },
        NOT_CR_GROUP: {
            TITLE: "Strategic Portfolio Owner",
            CONTENT: "You have already picked group not in CR division. Please try with correct CR groups."
        },
        SAME_APPROVER: {
            TITLE: "Strategic Portfolio Owner",
            CONTENT: "Your strategic portfolio owner and responsible department could not be same."
        }
    };
    // Change Workflow ID
    static CHANGE_WORKFLOW_ID = {
        SUCCESS: "The Workflow ID is updated successfully.",
        FAILED: "The  Workflow ID is not updated." + Constants.POSTFIX_MESSAGE.TRY_AGAIN
    };
    // Cancel report
    static CANCEL_REPORT = {
        UPLOAD: {
            SUCCESS: "The uploaded report is cancelled successfully.",
            FAILED: "The uploaded report is not cancelled." + Constants.POSTFIX_MESSAGE.TRY_AGAIN
        },
        ORDER: {
            SUCCESS: "The ordered report is cancelled successfully.",
            FAILED: "The ordered report is not cancelled." + Constants.POSTFIX_MESSAGE.TRY_AGAIN
        }
    };
    // Dialog message
    static DIALOG_MESSAGE = {
        MIGRATE: "Migrating",
        STOP: "Stopping",
        CLEAN: "Cleaning",
        RETRIEVE_BOOKMARKS: "Retrieving bookmarks",
        REMOVE_BOOKMARK: "Removing bookmark",
        REMOVE_DIVISION: "Removing division",
        REMOVE_GROUP: "Removing group",
        REMOVE_RULE: "Removing rule",
        RETRIEVE_PENDING_UPLOADS: "Retrieving pending uploads",
        RETRIEVE_PENDING_ORDERS: "Retrieving pending orders",
        RETRIEVE_CLOSED_UPLOADS: "Retrieving cancelled/rejected uploads",
        MOVE_REPORT: "Moving report",
        RETRIEVE_DEPARTMENTS: "Retrieving departments",
        RETRIEVE_ALL_DEPARTMENTS: "Retrieving departments of divisions",
        RETRIEVE_DATA: "Retrieving data",
        SEND_AIM_EMAILS: "Sending AIM emails",
        COUNT_EMPTY_LISTS: "Counting empty lists",
        REMOVE_EMPTY_LISTS: "Removing empty lists",
        CREATE_DEPARTMENT_LIST: "Creating department list",
        EXPORT_RESULT: "Exporting result",
        EXPORT_SEARCH_DATA: "Exporting search data",
        CREATE_NEW_DIVISION: "Creating new division",
        CREATE_NEW_GROUP: "Creating new group",
        CREATE_NEW_RULE: "Creating new rule",
        UPDATE_GROUP: "Updating group",
        UPDATE_RULE: "Updating rule",
        CREATE_LISTS: "Creating lists",
        ACCEPT_REPORTS: "Accepting reports",
        REJECT_REPORTS: "Rejecting reports",
        ADD_ATTACHMENTS: "Adding attachments",
        GRANT_PERMISSIONS: "Granting permissions is processing",
        UPDATE_WORKFLOW_ID: "Updating Workflow ID",
        CANCEL_UPLOADED_REPORT: "Cancelling uploaded report",
        CANCEL_ORDERED_REPORT: "Cancelling ordered report",
        SEARCHING: "Searching",
        RETRIVE: "Retrieving",
        EXPORT: "Exporting",
        UPDATE: "Updating",
        RESTART: "Restarting",
        DELETE: "Deleting",
        UPLOAD: "Uploading",
        LOAD_ROU: "Loading Responsible Department",
        LOAD_LL_DIVISIONAL_ADMIN: "Loading Divisional Lessons Learned Coordinator",
        LOAD_GM: "Loading Strategic Portfolio Owner",
    };

    // ------------------------------ DROP DOWN ARRAY ------------------------------
    // Document types
    static DD_DOCUMENT_TYPES_ALL = [
        { key: '', text: 'All' },
        { key: 'RnD', text: 'RnD' },
        { key: 'LL', text: 'LL' },
        { key: 'Thesis', text: 'Thesis' },
        { key: 'Paper', text: 'Paper' }
    ];
    static DD_DOCUMENT_TYPES_FOR_SEARCH = [
        { key: '', text: '--- All ---' },
        { key: 'ResearchReports', text: 'Research and Development' },
        { key: 'LessonsLearned', text: 'Lessons Learned' },
        { key: 'Thesis', text: 'Thesis' },
        { key: 'Paper', text: 'Paper' }
    ];
    static DD_DOCUMENT_TYPES_FOR_ADMIN_MOVE = [
        { key: '', text: 'Choose upload type ...' },
        { key: 'RnD', text: 'Research and Development' },
        { key: 'LL', text: 'Lessons Learned' },
    ];
    static DD_DOCUMENT_TYPES = [
        { key: 'RnD', text: 'RnD' },
        { key: 'LL', text: 'LL' },
        { key: 'Thesis', text: 'Thesis' },
        { key: 'Paper', text: 'Paper' }
    ];

    // Type Master
    static DD_TYPE_MASTER_DATA: any = {
        RnD: [
            { key: 'Final Report', text: 'Final Report' },
            { key: 'Interim Report', text: 'Interim Report' }
        ],
        Thesis: [
            { key: "Bachelor Thesis", text: "Bachelor Thesis" },
            { key: "Master Thesis", text: "Master Thesis" },
            { key: "Dissertation", text: "Dissertation" }
        ],
        Paper: [
            { key: "Conference Paper", text: "Conference Paper" },
            { key: "Journal Paper", text: "Journal Paper" }
        ]
    };

    // Security classes
    static DD_SECURITY_CLASSES_ONLY_1 = [
        { key: "1 Internal", text: "1 Internal", disabled: false }
    ];
    static DD_SECURITY_CLASSES_ONLY_2 = [
        { key: "1 Internal", text: "1 Internal", disabled: false },
        { key: "2 Confidential", text: "2 Confidential", disabled: false }
    ];
    static DD_SECURITY_CLASSES = [
        { key: "1 Internal", text: "1 Internal", disabled: false },
        { key: "2 Confidential", text: "2 Confidential", disabled: false },
        { key: "3 Strictly Confidential", text: "3 Strictly Confidential", disabled: false }
    ];

    static DD_SECURITY_CLASSES_ONLY_2_ALL = [
        { key: "", text: "Choose security class ...", disabled: true },
        { key: "1 Internal", text: "1 Internal", disabled: false },
        { key: "2 Confidential", text: "2 Confidential", disabled: false }
    ];
    static DD_SECURITY_CLASSES_ONLY_2_AND_3 = [
        { key: "2 Confidential", text: "2 Confidential", disabled: false },
        { key: "3 Strictly Confidential", text: "3 Strictly Confidential", disabled: false }
    ];
    static DD_SECURITY_CLASSES_ALL = [
        { key: "", text: "Choose security class ...", disabled: true },
        { key: "1 Internal", text: "1 Internal", disabled: false },
        { key: "2 Confidential", text: "2 Confidential", disabled: false },
        { key: "3 Strictly Confidential", text: "3 Strictly Confidential", disabled: false }
    ];

    static DD_SECURITY_CLASSES_ONLY_CLASS_3 = [
        { key: "3 Strictly Confidential", text: "3 Strictly Confidential", disabled: false }
    ];

    // Relavant For RelForForeignTradeLegislation
    static DD_RELAVANT_FOR_REL_FOR_FOREIGN_TRADE_LEGISLATION = [
        { key: 'Yes', text: 'Yes' },
        { key: 'No', text: 'No' }

    ];


    // Search number of results
    static DD_SEARCH_NUMBER_OF_RESULTS = [
        { key: 10, text: "10" },
        { key: 25, text: "25" },
        { key: 50, text: "50" }
    ];

    // Search sort options
    static DD_SEARCH_SORT_OPTIONS = [
        { key: "", text: "Relevance" },
        // { key: "Title_0", text: "Title (A-Z)" },
        // { key: "Title_1", text: "Title (Z-A)" },
        { key: "LowerTitle_0", text: "Title (A-Z)" },
        { key: "LowerTitle_1", text: "Title (Z-A)" },
        { key: "FeberDocumentDate_0", text: "Date of document (Oldest)" },
        { key: "FeberDocumentDate_1", text: "Date of document (Newest)" },
        { key: "ModifiedOWSDATE_0", text: "Changed (Oldest)" },
        { key: "ModifiedOWSDATE_1", text: "Changed (Newest)" }
    ];

    // Month
    static DD_MONTH_OPTIONS = [
        { key: 1, text: "January" },
        { key: 2, text: "February" },
        { key: 3, text: "March" },
        { key: 4, text: "April" },
        { key: 5, text: "May" },
        { key: 6, text: "June" },
        { key: 7, text: "July" },
        { key: 8, text: "August" },
        { key: 9, text: "September" },
        { key: 10, text: "October" },
        { key: 11, text: "November" },
        { key: 12, text: "December" }
    ];

    static DD_LOG_TYPE_OPTIONS = [
        { key: "api", text: "Application log" },
        { key: "wcf", text: "WCF log" },
    ];

    static DD_LOG_MODE_OPTIONS = [
        { key: "", text: "All" },
        { key: "ERROR", text: "Error" },
        { key: "INFO", text: "Info" }
    ];

    static UPLOAD_INFO_MESSAGE = {
        TITLE: "Please use an English title. If the original title is not in English, please translate it.",
        AUTHORS: "This is an active directory search, not a free text field. Only Bosch employees can be selected. All authors stated here will receive a workflow to approve the report after finishing the upload.",
        REPORT_DATE: "Insert the date your document has been finished and released.",
        RND_REPORT_TYPE: "Let others know if your report is final and closed, or an interim report.",
        THESIS_REPORT_TYPE: "Let others know if your document is a Bachelor Thesis, Master Thesis or Dissertation.",
        PAPER_REPORT_TYPE: "Let others know if your paper has been presented at a conference or published in a scientific journal.",
        REPORT_NUMBER: "There is no central FEBER document number. You may add your division-specific document number if available.",
        PROJECT_NUMBER: "There is no central FEBER document number. You may add your division-specific document number if available.",
        RELEVANT_FOREIGN_TRADE: "FEBER offers the possibility to mark documents as export control relevant. This means, that access to this document must not be granted to departments of defined countries.",
        SECURITY_CLASS: "Access to the document can be restricted via security classes. SC-1: All employees with a FEBER-User worldwide can access document. SC-2: Access can be granted to whole groups. SC-3: Access cannot be granted to groups, only to defined people.",
        AUTHORIZED_ASSO: "You can grant access rights to specific people already at this point. They don't have to apply for the access after the release of the document.",
        AUTHORIZED_ORGA: "You can grant access rights to specific organization already at this point. They don't have to apply for the access after the release of the document.",
        KEYWORDS: "Keywords help others to decide, if your report is relevant to them. Examples of keywords are shown based on the content of your report.",
        ABSTRACT: "A short overview helps others to decide if your report is relevant for them.",
        RESPONSIBLE_DEPARTMENT: "This will be the master of data of the document. The department head has to approve the upload and the granting of access rights.",
        ADDITIONAL_APRROVERS: "Additional approvers will review your report before uploading. They have to approve the report before it can be found in FEBER.",
        NOTIFICATION: "You can notify colleagues via Mail regarding the upload of your report.",
        NAME_CONFERENCE: "Let others know which conference you attended.",
        LOCATION_CONFERENCE: "Where has the conference taken place?",
        DATE_CONFERENCE: "Insert the conference date.",
        NAME_JOURNAL: "Let others know in which Journal your paper has been published.",
        DATE_PUBLICATION: "Insert the publication date.",
        GROUP_MANAGER: "This will be the master of data of the document. The Strategic Portfolio Owner has to approve the upload and the granting of access rights.",
    };

}

export default Constants;