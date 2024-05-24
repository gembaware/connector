import * as React from 'react';

import './Main.css';

import { ContentType, HttpVerb, sendHttpRequest } from '../../../utils/httpRequest';
import api from '../../api';

import PartnerData from '../../../classes/Partner';
import Partner from '../../../classes/Partner';
import CompanyCache from '../../../classes/CompanyCache';
import CompanyData, { EnrichmentStatus } from '../../../classes/Company';

import AppContext from '../AppContext';
import ContactPage from '../Contact/ContactPage/ContactPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Search, { SearchState } from '../Search/Search';
import CustomField from "../CustomField/CustomField";
import GmbDropDownList from "../GmbDropDownList/GmbDropDownList";
import { faArrowLeft, faPlusCircle, faRedoAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import EnrichmentInfo, { EnrichmentInfoType } from '../../../classes/EnrichmentInfo';
import Progress from '../GrayOverlay';
import { TooltipHost } from 'office-ui-fabric-react';
import { _t, saveTranslations, translationsExpired } from '../../../utils/Translator';

type MainProps = {
    canCreatePartner: boolean;
};

type MainState = {
    matchedPartners: Partner[];
    partnersLoading: boolean;
    translationsLoading: boolean;
    searchQuery: string;
    selectedPartner: Partner;
    isSearching: boolean;
    backStack: BackStackItem[];
    poppedElement: BackStackItem;
    contactKey: number; //used for contact refresh
    loadPartner: boolean;
    customFieldValue: string;
    gmbDropDownListValue: string;
};

enum BackStackItemType {
    partner,
    query,
}

type BackStackItem = {
    type: BackStackItemType;
    element: string | Partner;
    historyState?: any;
};

class Main extends React.Component<MainProps, MainState> {
    companyCache: CompanyCache;

    constructor(props) {
        super(props);
        this.state = {
            matchedPartners: undefined,
            searchQuery: undefined,
            selectedPartner: undefined,
            isSearching: false,
            partnersLoading: true,
            translationsLoading: true,
            backStack: [],
            poppedElement: undefined,
            contactKey: Math.random(),
            loadPartner: true,
            customFieldValue: undefined,
            gmbDropDownListValue: "",
        };

        this.companyCache = new CompanyCache(2, 200, 0.25);
    }

    componentDidMount() {
        if (this.context.isConnected()) {
            this.getAllMatchedPartnersRequest()
            if (translationsExpired()) {
                this.getTranslations();
            } else {
                this.setState({ translationsLoading: false });
            }
        } else {
            this.setState({ translationsLoading: false });
            this.getPartnerDisconnectedRequest();
        }
    }

    private addPartnerToDbRequest = () => {
        if (!this.context.isConnected()) {
            this.context.navigation.goToLogin();
            return;
        }

        this.setState({ partnersLoading: true });

        const addPartnerRequest = sendHttpRequest(
            HttpVerb.POST,
            api.baseURL + api.createPartner,
            ContentType.Json,
            this.context.getConnectionToken(),
            {
                name: this.state.selectedPartner.name,
                email: this.state.selectedPartner.email,
                company: this.state.selectedPartner.company.id,
            },
            true,
        );

        addPartnerRequest.promise
            .then((response) => {
                const parsed = JSON.parse(response);
                const newId = parsed.result.id;
                let partner = this.state.selectedPartner;
                partner.id = newId;
                this.setState({ selectedPartner: partner, partnersLoading: false });
                this.onRefreshPartnerClick();
            })
            .catch((error) => {
                this.setState({ partnersLoading: false });
                this.context.showHttpErrorMessage(error);
            });
    };

    private getAllMatchedPartnersRequest = () => {
        if (!Office.context.mailbox.item) {
            return;
        }

        let emailInfos = this.getEmailInfo()
        if (emailInfos.email) {
            this._getAllMatchedPartnerRequest(emailInfos);
        } else {
            console.log('1')
            let emailInfos = this.getEmailInfosAsync();
            console.log('4')
            this._getAllMatchedPartnerRequest(emailInfos);
        }
    };

    private _getAllMatchedPartnerRequest(emailInfos: { email: string, displayName: string }) {
        let email = emailInfos.email;
        let displayName = emailInfos.displayName;
        console.log('5')
        const CancellableMatchedPartnersRequest = sendHttpRequest(
            HttpVerb.POST,
            api.baseURL + api.searchPartner,
            ContentType.Json,
            this.context.getConnectionToken(),
            {
                search_term: email,
            },
            true,
        );
        this.context.addRequestCanceller(CancellableMatchedPartnersRequest.cancel);
        CancellableMatchedPartnersRequest.promise
            .then((response) => {
                const parsed = JSON.parse(response);
                let partners = parsed.result.partners.map((partner_json) => {
                    return PartnerData.fromJSON(partner_json);
                });
                if (partners.length > 0) {
                    partners = Partner.sortBestMatches(email, displayName, partners);
                    this.setState({
                        matchedPartners: partners,
                        selectedPartner: partners[0],
                    });
                } else {
                    //no partners were found in database, we create a new partner
                    const newPartner = PartnerData.createNewPartnerFromEmail(displayName, email);
                    partners.push(newPartner);
                    this.setState({
                        matchedPartners: partners,
                        selectedPartner: partners[0],
                    });
                }
                this.setState({ partnersLoading: false });
            })
            .catch((error) => {
                this.context.showHttpErrorMessage(error);
                this.setState({ partnersLoading: false });
                console.log(error);
            });
    }

    private getEmailInfo =  () => {
        let email = Office.context.mailbox.item.from.emailAddress;
        let displayName = Office.context.mailbox.item.from.displayName;

        if (Office.context.mailbox.userProfile.emailAddress == Office.context.mailbox.item.from.emailAddress) {
            email = Office.context.mailbox.item.to[0].emailAddress;
            displayName = Office.context.mailbox.item.to[0].displayName;
        }

        return {email: email, displayName: displayName};
    }



    private getEmailInfosAsync() {
        let item = Office.context.mailbox.item;
        let toRecipients: Office.Recipients;
        if (item.itemType == Office.MailboxEnums.ItemType.Message) {
            toRecipients = item.to;
        }
        return this._blockForPromiseSync(this._getEmailInfosAsync(toRecipients));
    }

    /**
     * asynchronous call to Office to get recipient information
     * @param toRecipients Object to call the getAsync function
     */
    private _getEmailInfosAsync(toRecipients: Office.Recipients) : Promise<{email: string, displayName: string}> {
        return new Promise((resolve) => {
            toRecipients.getAsync((asyncResult) => {
                if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                    console.log(asyncResult.error.message);
                    return resolve({ email: '', displayName: '' });
                } else {
                    console.log('2');
                    let email = asyncResult.value[0].emailAddress;
                    let displayName = asyncResult.value[0].displayName;
                    resolve({ email: email, displayName: displayName } );
                }
            });
        });
    }

    /**
     * Blocker of promise to pause the program while the promise isn't resolve
     * @param p promise to block
     */
    private _blockForPromiseSync<T>(p: Promise<T>): T {
        let result: T | undefined = undefined;
        let error: any | undefined = undefined;

        p.then(value => {result = value})
            .catch(err => {error = err})

        require('deasync').loopWhile(() =>
            result === undefined && error === undefined)

        if (error !== undefined) {
            throw error!
        }
        return result!
    }

    private getTranslations = () => {
        this.setState({ translationsLoading: true });
        const requestPromise = sendHttpRequest(
            HttpVerb.POST,
            api.baseURL + api.getTranslations,
            ContentType.Json,
            this.context.getConnectionToken(),
            {
                plugin: 'outlook',
            },
            true,
        ).promise;
        requestPromise
            .then((response) => {
                const parsed = JSON.parse(response);
                let translations = parsed.result;
                saveTranslations(translations);
            })
            .finally(() => {
                this.setState({ translationsLoading: false });
            });
    };

    private getPartnerDisconnectedRequest = () => {
        if (!Office.context.mailbox.item) {
            return;
        }
        Office.context.mailbox.getUserIdentityTokenAsync((idTokenResult) => {
            let emailInfos = this.getEmailInfo();
            if (emailInfos.email) {
                this._getPartnerDisconnectedRequest(emailInfos, idTokenResult);
            } else {
                let emailInfos = this.getEmailInfosAsync();
                this._getPartnerDisconnectedRequest(emailInfos, idTokenResult);
            }
        });
    };

    private _getPartnerDisconnectedRequest(emailInfos:{ displayName: string, email: string }, idTokenResult: Office.AsyncResult<string>) {
        let email = emailInfos.email;
        let displayName = emailInfos.displayName

        const partner = PartnerData.createNewPartnerFromEmail(displayName, email);

        const cachedCompany: CompanyData = this.companyCache.get(email);

        if (cachedCompany) {
            partner.company = cachedCompany;
            partner.company.enrichmentStatus = EnrichmentStatus.enriched;
            this.setState({
                matchedPartners: [partner],
                selectedPartner: partner,
                partnersLoading: false,
            });
        } else {
            const senderDomain = email.split('@')[1];
            const cancellableRequest = sendHttpRequest(
                HttpVerb.POST,
                api.iapLeadEnrichment,
                ContentType.Json,
                null,
                {
                    params: {
                        email: email,
                        domain: senderDomain,
                        extuid: idTokenResult.value,
                    },
                },
            );
            this.context.addRequestCanceller(cancellableRequest.cancel);
            cancellableRequest.promise
                .then((response) => {
                    const parsed = JSON.parse(response);
                    if ('error' in parsed.result) {
                        const enrichmentInfo = new EnrichmentInfo(
                            parsed.result.error.type,
                            parsed.result.error.info,
                        );
                        if (enrichmentInfo.type != EnrichmentInfoType.NoData)
                            this.context.showTopBarMessage(enrichmentInfo);
                        partner.company = CompanyData.getEmptyCompany();
                        partner.company.enrichmentStatus = EnrichmentStatus.enrichmentEmpty;
                        this.setState({
                            matchedPartners: [partner],
                            selectedPartner: partner,
                            partnersLoading: false,
                        });
                        return;
                    }
                    partner.company = CompanyData.fromRevealJSON(parsed.result);
                    this.companyCache.add(partner.company);
                    partner.company.enrichmentStatus = EnrichmentStatus.enriched;
                    this.setState({
                        matchedPartners: [partner],
                        selectedPartner: partner,
                        partnersLoading: false,
                    });
                })
                .catch((error) => {
                    this.context.showHttpErrorMessage(error);
                    this.setState({ partnersLoading: false });
                });
        }
    }

    private onSearchClick = (state) => {
        if (this.context.isConnected()) {
            const backStackItem = {
                type: BackStackItemType.partner,
                element: this.state.selectedPartner,
                historyState: state,
            } as BackStackItem;
            if (this.state.backStack.length > 0 || this.state.matchedPartners.length == 1) {
                this.setState({ isSearching: true, searchQuery: '' });
            } else {
                this.setState({
                    isSearching: true,
                    searchQuery: this.state.selectedPartner.email,
                });
            }

            this.pushItemBackStack(backStackItem);
        } else {
            this.context.navigation.goToLogin();
        }
    };

    private onSearchPartnerItemClick = (partner: Partner, state: SearchState) => {
        const backStackItem = {
            type: BackStackItemType.query,
            element: state.query,
            historyState: state,
        } as BackStackItem;
        this.pushItemBackStack(backStackItem);
        this.setState({
            isSearching: false,
            selectedPartner: partner,
            contactKey: Math.random(),
            loadPartner: true,
        });
    };

    private onRefreshPartnerClick = () => {
        this.setState({ contactKey: Math.random(), loadPartner: true });
    };

    private onBackClicked = () => {
        let backStack = [...this.state.backStack];
        const backStackItem = backStack.pop();
        if (backStackItem.type == BackStackItemType.partner) {
            const partner = backStackItem.element as Partner;
            this.setState({
                isSearching: false,
                selectedPartner: partner,
                poppedElement: backStackItem,
                backStack: backStack,
                loadPartner: false,
            });
        } else {
            const query = backStackItem.element as string;
            this.setState({
                isSearching: true,
                searchQuery: query,
                poppedElement: backStackItem,
                backStack: backStack,
            });
        }
    };

    private pushItemBackStack = (item: BackStackItem) => {
        let backStack = [...this.state.backStack];
        backStack.push(item);
        this.setState({ backStack: backStack });
    };

    private updatePartner = (partner: Partner) => {
        this.setState({ selectedPartner: partner });
    };

    render() {
        if (this.state.partnersLoading || this.state.translationsLoading) {
            return <Progress />;
        }

        let topBarContent = null;
        let backButton = null;

        if (this.state.backStack.length != 0) {
            backButton = (
                <div className="odoo-muted-button" onClick={this.onBackClicked} style={{ border: 'none' }}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </div>
            );
        }

        let broadCampStyle = {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'medium',
            color: '#787878',
            fontWeight: 600,
        };

        if (this.state.isSearching) {
            topBarContent = (
                <div style={broadCampStyle}>
                    {backButton}
                    <div>{_t('Search In Database')}</div>
                    <span />
                </div>
            );
        } else {
            let refrechPartnerButton = null;
            let addPartnerButton = null;

            if (this.context.isConnected()) {
                refrechPartnerButton = (
                    <TooltipHost content={_t('Refresh Contact')}>
                        <div
                            className="odoo-muted-button"
                            onClick={this.onRefreshPartnerClick}
                            style={{ border: 'none' }}>
                            <FontAwesomeIcon icon={faRedoAlt} style={{ cursor: 'pointer' }} />
                        </div>
                    </TooltipHost>
                );
            }

            if (
                this.state.selectedPartner &&
                !this.state.selectedPartner.isAddedToDatabase() &&
                this.props.canCreatePartner
            ) {
                addPartnerButton = (
                    <TooltipHost content={_t('Add Contact To Database')}>
                        <div
                            className="odoo-muted-button"
                            onClick={this.addPartnerToDbRequest}
                            style={{ border: 'none' }}>
                            <FontAwesomeIcon icon={faPlusCircle} style={{ cursor: 'pointer' }} />
                        </div>
                    </TooltipHost>
                );
            }

            topBarContent = (
                <div style={broadCampStyle}>
                    {backButton}
                    <div>{_t('Contact Details')}</div>
                    <div style={{ display: 'flex' }}>
                        <TooltipHost content={_t('Search In Odoo')}>
                            <div className="odoo-muted-button" onClick={this.onSearchClick} style={{ border: 'none' }}>
                                <FontAwesomeIcon icon={faSearch} style={{ cursor: 'pointer' }} />
                            </div>
                        </TooltipHost>
                        {refrechPartnerButton}
                        {addPartnerButton}
                    </div>
                </div>
            );
        }

        let topBar = <div style={{ margin: '8px' }}>{topBarContent}</div>;

        let connectionButton = (
            <div className="link-like-button connect-button" onClick={() => this.context.navigation.goToLogin()}>
                Login
            </div>
        );
        if (this.context.isConnected()) {
            connectionButton = (
                <div
                    className="link-like-button connect-button"
                    onClick={() => {
                        this.context.disconnect();
                        this.context.navigation.goToLogin();
                    }}>
                    {_t('Logout')}
                </div>
            );
        }

        let mainContent = null;

        if (this.state.isSearching) {
            mainContent = (
                <div>
                    <Search
                        query={this.state.searchQuery}
                        canCreatePartner={this.props.canCreatePartner}
                        historyState={
                            this.state.poppedElement && this.state.poppedElement.type == BackStackItemType.query
                                ? this.state.poppedElement.historyState
                                : undefined
                        }
                        onPartnerClick={this.onSearchPartnerItemClick}
                    />
                </div>
            );
        } else {
            if (this.state.selectedPartner) {
                mainContent = (
                    <>
                        <ContactPage
                            partner={this.state.selectedPartner}
                            onPartnerChanged={this.updatePartner}
                            loadPartner={this.state.loadPartner}
                            key={this.state.contactKey}
                            customFieldValue={this.state.customFieldValue}
                            gmbDropDownSelectedValue={this.state.gmbDropDownListValue}
                        />
                    </>
                );
            }
        }

        const gmbDropDownList = (
            <>
                <GmbDropDownList
                    data={['un', 'deux', 'trois']}
                    onchange={function (value: string) {
                        console.log("selected -- " + value);
                        this.setState({gmbDropDownListValue: value});
                    }.bind(this)}
                />
            </>
        )

        const customField = (
            <>
                <CustomField
                    value={this.state.customFieldValue}
                    onchange={function (value:string) {
                        console.log('Value changed -- ' + value);
                        this.setState({customFieldValue: value});
                    }.bind(this)}
                />
            </>
        )

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div>{topBar}</div>
                <div>{gmbDropDownList}</div>
                <div style={{ flex: 1 }}>{mainContent}{customField}</div>
                <div>{connectionButton}</div>
            </div>
        );
    }
}
Main.contextType = AppContext;

export default Main;
