import {isNumber, isObject, isString} from 'lodash';
import {FlatWorkpad} from './flat-workpad.model';
import {ReportGroup} from './report-group.model';
import {BaseWorkpad} from './base-workpad.model';
import {ExploreConstants, URLConstants} from '../../constants';
import {AppUtils} from '../../utils/app.utils';
import {AbstractFavoriteConfig, FavoriteDisplayEnum, SerializeFavoriteType, CoreFavoriteUtils} from '@blk/explore-ui-core';

/**
 * Class used for saving and loading of workspace information.
 */
export class Workspace extends AbstractFavoriteConfig {
    workpads: Array<BaseWorkpad>;

    constructor(data?: any) {
        super();
        this.workpads = [];
        this.title = ExploreConstants.UNTITLED_WORKSPACE;
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * configType
     */
    static get configType() {
        return 'workspace';
    }

    /**
     * This method generates a URL for the user's current workspace.
     * We extract the href and append the workspace ID to it.
     * If location is localhost we use dev explore beta.
     */
    generateWorkspaceUrl(): string {
        // If we have a workspace ID then generate the URL with that workspace ID.
        if (isNumber(this.id) || isString(this.id)) {
            return AppUtils.getHref() + '?' + URLConstants.WORKSPACE + '=' + this.id;
        }
    }

    /**
     * getConfigType
     */
    getConfigType(): string {
        return Workspace.configType;
    }

    /**
     * doCopyFrom
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof Workspace)) {
            return;
        }

        this.workpads = source.workpads;
    }

    /**
     * doDeserialize
     */
    protected doDeserialize(data: any): void {
        if (data.workpads) {
            for (const workpadData of data.workpads) {
                if (!workpadData.portfolio && (!workpadData.portfolios || workpadData.portfolios.length === 0)) {
                    continue;
                }
                if (workpadData.configType === ReportGroup.configType || workpadData.isReportGroup) {
                    this.workpads.push(new ReportGroup(workpadData));
                } else {
                    this.workpads.push(new FlatWorkpad(workpadData));
                }
            }
        }
    }

    /**
     * doSerialize
     */
    protected doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        const data = {
            configType: Workspace.configType,
            workpads: []
        };

        for (const workpad of this.workpads) {
            data.workpads.push(workpad.serialize(isNested));
        }

        return data;
    }

    /**
     * add one or many workpads
     */
    addWorkpads(workpadsToAdd: BaseWorkpad | BaseWorkpad[]): void {
        if (Array.isArray(workpadsToAdd)) {
            for (const workpad of workpadsToAdd) {
                this.workpads.push(workpad);
            }
        } else {
            this.workpads.push(workpadsToAdd);
        }
    }

    /**
     * remove a workpad
     */
    removeWorkpad(workpadToRemove: BaseWorkpad): void {
        const index = this.workpads.indexOf(workpadToRemove);
        if (index !== -1) {
            this.workpads.splice(index, 1);
        }
    }

    /**
     * returns a list of ReportGroups from the list of workpads
     */
    getReportGroups(): ReportGroup[] {
        const reportGroupList: ReportGroup[] = [];
        this.workpads.forEach(wp => {
            if (wp instanceof ReportGroup) {
                reportGroupList.push(wp);
            }
        });
        return reportGroupList;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.WORKSPACE;
    }

    /**
     * Clear any flags that were set in order to detect changes to the favorite (ie column option)
     */
    resetChangeDetectionFlags(): void {
        // reset any reports that are not favorites themselves
        this.workpads.forEach(workpad => {
            workpad.reports.filter(report => !report.id).forEach(r => {
                r.resetChangeDetectionFlags();
            });
        });
    }

    /**
     * returns the user permission group.
     */
    public getUserGroup(): string{
        return CoreFavoriteUtils.getFavoriteOwnerDisplayName(this.owner, this.userPermGrps);
    }
}
