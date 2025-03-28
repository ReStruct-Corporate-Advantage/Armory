/**
 * Constants for the date formats
 */
export class DateFormatConstants {
    static readonly DATE = 'dateFormat';
    static readonly ALADDIN_DATE_FORMAT_NAME  = 'Aladdin date format';

    static readonly DDMMMYYYY_DASH = 'DD-MMM-YYYY';
    static readonly DDMMMYYYY_SPACE = 'DD MMM YYYY';
    static readonly DDMMYYYY_DASH = 'DD-MM-YYYY';
    static readonly YYYY_MM_DD_DASH = 'YYYY-MM-DD';
    static readonly YYYY_MM_DD_HH_mm_ss_ZZ = 'YYYY-MM-DD HH:mm:ss ZZ';
    static readonly YYYY_MM_DD_HH_mm_ss = 'YYYY-MM-DD HH:mm:ss';
    static readonly YYYYMMDD = 'YYYYMMDD';

    // UK Format
    static readonly DMYYYY_SLASH = 'D/M/YYYY';
    static readonly DMMYYYY_SLASH = 'D/MM/YYYY';
    static readonly DDMYYYY_SLASH = 'DD/M/YYYY';
    static readonly DDMMYYYY_SLASH = 'DD/MM/YYYY';

    // US Format
    static readonly MDYYYY_SLASH = 'M/D/YYYY';
    static readonly MDDYYYY_SLASH = 'M/DD/YYYY';
    static readonly MMDYYYY_SLASH = 'MM/D/YYYY';
    static readonly MMDDYYYY_SLASH = 'MM/DD/YYYY';
    static readonly MMDDYY_SLASH = 'MM/DD/YY';
    static readonly EEEE_MMMM_d_yyyy = 'EEEE, MMMM d, yyyy';
    static readonly dddd_MMMM_D_YYYY = 'dddd, MMMM D, YYYY';

    static readonly DATE_FORMATS = [
        'MMM-D-YYYY', 'MMM-DD-YYYY', 'D-MMM-YYYY', 'DD-MMM-YYYY', 'MMM-D-YY', 'MMM-DD-YY', 'D-MMM-YY', 'DD-MMM-YY',
        'M/D/YYYY', 'M/DD/YYYY', 'MM/D/YYYY', 'MM/DD/YYYY', 'M-D-YYYY', 'M-DD-YYYY', 'MM-D-YYYY', 'MM-DD-YYYY',
        'M/D/YY', 'M/DD/YY', 'MM/D/YY', 'MM/DD/YY', 'M-D-YY', 'M-DD-YY', 'MM-D-YY', 'MM-DD-YY',
        'D/M/YYYY', 'D/MM/YYYY', 'DD/M/YYYY', 'DD/MM/YYYY', 'D-M-YYYY', 'D-MM-YYYY', 'DD-M-YYYY', 'DD-MM-YYYY',
        'D/M/YY', 'D/MM/YY', 'DD/M/YY', 'DD/MM/YY', 'D-M-YY', 'D-MM-YY', 'DD-M-YY', 'DD-MM-YY',
        'MMM D, YYYY', 'MMM DD, YYYY HH:mm:ss'
    ];
}
