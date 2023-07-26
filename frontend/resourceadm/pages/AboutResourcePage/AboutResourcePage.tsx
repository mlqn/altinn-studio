import React, { useState } from 'react';
import classes from './AboutResourcePage.module.css';
import { Select, TextField, TextArea, Button, Spinner } from '@digdir/design-system-react';
import { Switch } from 'resourceadm/components/Switch';
import {
  resourceSectorsMockOptions,
  resourceThematicAreaMockOptions,
} from 'resourceadm/data-mocks/resources';
import { useOnce } from 'resourceadm/hooks/useOnce';
import { get, put } from 'app-shared/utils/networking';
import { useParams } from 'react-router-dom';
import { getEditResourceUrl, getResourceUrl } from 'resourceadm/utils/backendUrlUtils';
import {
  SupportedLanguageKey,
  ResourceBackendType,
  ResourceTypeOptionType,
  ResourceKeywordType,
  VersionType,
} from 'resourceadm/types/global';
import { ScreenReaderSpan } from 'resourceadm/components/ScreenReaderSpan';
import { WarningCard } from 'resourceadm/components/PolicyEditor/WarningCard';
import { RightTranslationBar } from 'resourceadm/components/RightTranslationBar';

/**
 * The resource type options to be used in the select
 */
const resourceTypeOptions = [
  { value: 'Standard', label: 'Standard' },
  { value: 'System ressurs', label: 'System ressurs' },
  { value: 'Maskinporten skjema', label: 'Maskinporten skjema' },
];

/**
 * Initial value for languages with empty fields
 */
const emptyLangauges: LanguageStringType = { nb: '', nn: '', en: '' };

export interface LanguageStringType {
  nb?: string;
  nn?: string;
  en?: string;
}

interface Props {
  showAllErrors: boolean;
}

/**
 * Page that displays information about a resource
 *
 * @param props.showAllErrors flag to decide if all errors should be shown or not
 */
export const AboutResourcePage = ({ showAllErrors }: Props) => {
  // TODO - translation
  const { selectedContext, resourceId } = useParams();
  const repo = `${selectedContext}-resources`;

  // States to store the different input values
  const [resourceType, setResourceType] = useState<ResourceTypeOptionType>(undefined);
  const [title, setTitle] = useState<SupportedLanguageKey<string>>(emptyLangauges);
  const [description, setDescription] = useState<SupportedLanguageKey<string>>(emptyLangauges);
  const [homepage, setHomepage] = useState('');
  const [keywords, setKeywords] = useState('');
  const [sector, setSector] = useState<string[]>([]);
  const [thematicArea, setThematicArea] = useState('');
  const [rightDescription, setRightDescription] =
    useState<SupportedLanguageKey<string>>(emptyLangauges);
  const [isPublicService, setIsPublicService] = useState(false);
  const [version, setVersion] = useState<VersionType>();

  // To handle which translation value is shown in the right menu
  const [translationType, setTranslationType] = useState<
    'none' | 'title' | 'description' | 'rightDescription'
  >('none');

  // To handle the state of the aoge
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasResourceTypeError, setHasResourceTypeError] = useState(false);
  const [hasTitleError, setHasTitleError] = useState(false);
  const [hasDescriptionError, setHasDescriptionError] = useState(false);

  /**
   * Once the page loads, get the details about the resource and populate them
   */
  useOnce(() => {
    setIsLoading(true);
    get(getResourceUrl(selectedContext, repo, resourceId))
      .then((res) => {
        handlePopulateResource(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error getting the policy', err);
        setIsLoading(false);
        setHasError(true);
      });
  });

  /**
   * Populates the resource values correctly based on if they exist or not.
   *
   * @param res the response from backend
   */
  const handlePopulateResource = (res: unknown) => {
    const backendResource = res as ResourceBackendType;

    setResourceType(backendResource.resourceType ?? undefined);
    setHasResourceTypeError(
      backendResource.resourceType === undefined || backendResource.resourceType === null
    );

    setHasResourceTypeError(
      backendResource.resourceType === undefined || backendResource.resourceType === null
    );

    const backendTitle = backendResource.title;
    setTitle(backendTitle ?? emptyLangauges);
    setHasTitleError(
      backendTitle === undefined ||
        backendTitle === null ||
        backendTitle.nb === '' ||
        backendTitle.nn === '' ||
        backendTitle.en === ''
    );

    const backendDescription = backendResource.description;
    setDescription(backendDescription ?? emptyLangauges);
    setHasDescriptionError(
      backendDescription === undefined ||
        backendDescription === null ||
        backendDescription.nb === '' ||
        backendDescription.nn === '' ||
        backendDescription.en === ''
    );

    setHomepage(backendResource.homepage ?? '');
    setIsPublicService(backendResource.isPublicService ?? false);
    setSector(backendResource.sector ?? []);
    setThematicArea(backendResource.thematicArea ?? '');
    setRightDescription(backendResource.rightDescription ?? emptyLangauges);
    setVersion(backendResource.version);

    // TODO - Find out how to handle the keywords
    setKeywords(backendResource.keywords ? mapKeywordsArrayToString(backendResource.keywords) : '');
  };

  /**
   * ------------ Temporary functions -------------
   * The first one maps keyword to string, and the second from string to keyword
   *
   * TODO - Find out how to handle it in the future
   */
  const mapKeywordsArrayToString = (resourceKeywords: ResourceKeywordType[]): string => {
    return resourceKeywords.map((k) => k.word).join(', ');
  };
  const mapKeywordStringToKeywordTypeArray = (keywrodString: string): ResourceKeywordType[] => {
    return keywrodString.split(', ').map((val) => ({ language: 'nb', word: val.trim() }));
  };

  /**
   * Function that saves the resource to backend
   */
  const handleSaveResource = () => {
    // Sectors might look like this: https://data.norge.no/reference-data/eu/data-themes
    // Thematcic area might look like this: https://data.norge.no/reference-data/eu/eurovocs

    const editedResourceObject: ResourceBackendType = {
      identifier: resourceId,
      resourceType,
      title,
      description,
      keywords: mapKeywordStringToKeywordTypeArray(keywords),
      homepage,
      isPublicService,
      sector,
      thematicArea,
      rightDescription,
      version,
    };

    // Update the resource
    put(getEditResourceUrl(selectedContext, resourceId), editedResourceObject)
      .then(() => {
        // TODO - Display success message that it was saved
        // TODO - Display areas with errors
      })
      .catch((err) => {
        console.error('Error saving the policy', err);
      });
  };

  /**
   * Handles the change in the dropdown of resource type. Based on the string
   * selected it updates the resource type with the correct key.
   *
   * @param s the selected string
   */
  const onChangeResourceType = (s: string) => {
    if (s === 'Standard') setResourceType('Default');
    else if (s === 'System ressurs') setResourceType('Systemresource');
    else if (s === 'Maskinporten skjema') setResourceType('Maskinportenschema');
    else setResourceType(undefined);

    setHasResourceTypeError(
      !(s === 'Standard' || s === 'System ressurs' || s === 'Maskinporten skjema')
    );
  };

  /**
   * Converts the resource type key to the correct displayable string
   *
   * @returns the string to display
   */
  const getResourceTypeAsDisplayableString = () => {
    if (resourceType === 'Default') return 'Standard';
    else if (resourceType === 'Systemresource') return 'System ressurs';
    else if (resourceType === 'Maskinportenschema') return 'Maskinporten skjema';
    return undefined;
  };

  /**
   * Displays the given text in a warning card
   *
   * @param text the text to display
   */
  const displayWarningCard = (text: string) => {
    return (
      <div className={classes.warningCardWrapper}>
        <WarningCard text={text} />
      </div>
    );
  };

  /**
   * Sets the values of the selected field and updates if the error is shown or not.
   *
   * @param value the value typed in the input field
   */
  const handleChangeTranslationValues = (value: LanguageStringType) => {
    if (translationType === 'title') {
      setHasTitleError(value.nb === '' || value.nn === '' || value.en === '');
      setTitle(value);
    }
    if (translationType === 'description') {
      setHasDescriptionError(value.nb === '' || value.nn === '' || value.en === '');
      setDescription(value);
    }
    if (translationType === 'rightDescription') {
      setRightDescription(value);
    }
  };

  /**
   * Displays the correct content in the right translation bar.
   */
  const displayRightTranslationBar = () => {
    return (
      <div className={classes.rightWrapper}>
        <RightTranslationBar
          title={
            translationType === 'title'
              ? 'Navn på tjenesten'
              : translationType === 'description'
              ? 'Beskrivelse'
              : 'Delgasjonstekst'
          }
          value={
            translationType === 'title'
              ? title
              : translationType === 'description'
              ? description
              : rightDescription
          }
          onChangeValue={handleChangeTranslationValues}
          usesTextArea={translationType === 'description'}
        />
      </div>
    );
  };

  /**
   * Displays the content on the page
   */
  const displayContent = () => {
    if (isLoading) {
      return (
        <div className={classes.spinnerWrapper}>
          <Spinner size='3xLarge' variant='interaction' title='Laster inn policy' />
        </div>
      );
    }
    // TODO error handling
    if (hasError) {
      return <p>Beklager, det skjedde en feil under innhenting av innholdet</p>;
    }
    return (
      <>
        <h1 className={classes.pageHeader}>Om ressursen</h1>
        <h2 className={classes.subHeader}>Ressurs type</h2>
        <p className={classes.text}>Velg ett alternativ fra listen under</p>
        <div className={classes.inputWrapper}>
          <Select
            options={resourceTypeOptions}
            onChange={onChangeResourceType}
            value={getResourceTypeAsDisplayableString()}
            label='Ressurs type'
            hideLabel
            onFocus={() => setTranslationType('none')}
          />
          {showAllErrors &&
            hasResourceTypeError &&
            displayWarningCard('Du må legge til en ressurs type')}
        </div>
        <h2 className={classes.subHeader}>Navn på tjenesten</h2>
        <p className={classes.text}>
          Navnet vil synes for brukerne, og bør være beskrivende for hva tjenesten handler om. Pass
          på at navnet er forståelig og gjenkjennbart. Om mulig, bruk nøkkelord som man kan søke
          etter.
        </p>
        <p className={classes.subTitle}>{'Bokmål (standard)'}</p>
        <div className={classes.inputWrapper}>
          <TextField
            value={title['nb']}
            onChange={(e) => handleChangeTranslationValues({ ...title, nb: e.target.value })}
            onFocus={() => setTranslationType('title')}
            aria-labelledby='resource-titel'
          />
          <ScreenReaderSpan id='resource-titel' label='Navn på tjenesten' />
          {showAllErrors &&
            hasTitleError &&
            displayWarningCard('Du må legge til en tittel for Bokmål, Nynorsk, og Engelsk')}
        </div>
        <h2 className={classes.subHeader}>Beskrivelse</h2>
        <p className={classes.text}>
          Her må du beskrive tjenesten. Teksten kan bli synlig på flere områder på tvers av
          offentlige nettløsninger.
        </p>
        <p className={classes.subTitle}>{'Bokmål (standard)'}</p>
        <div className={classes.inputWrapper}>
          <TextArea
            value={description['nb']}
            resize='vertical'
            placeholder='Tekst'
            onChange={(e) => {
              handleChangeTranslationValues({ ...description, nb: e.currentTarget.value });
            }}
            onFocus={() => setTranslationType('description')}
            rows={5}
            aria-labelledby='resource-description'
          />
          <ScreenReaderSpan id='resource-description' label='Beskrivelse' />
          {showAllErrors &&
            hasDescriptionError &&
            displayWarningCard('Du må legge til en beskrivelse for Bokmål, Nynorsk, og Engelsk')}
        </div>
        {/* TODO - Find out if 'Tilgjengelig språk' should be inserted here */}
        <h2 className={classes.subHeader}>Hjemmeside</h2>
        <p className={classes.text}>Link til nettsiden der tjenesten kan startes av brukeren.</p>
        <div className={classes.inputWrapper}>
          <TextField
            value={homepage}
            onChange={(e) => setHomepage(e.target.value)}
            aria-labelledby='resource-homepage'
            onFocus={() => setTranslationType('none')}
          />
          <ScreenReaderSpan id='resource-homepage' label='Hjemmeside' />
        </div>
        <h2 className={classes.subHeader}>Nøkkelord</h2>
        <p className={classes.text}>
          {'Skriv nøkkelord for ressursen, separer hvert ord med et komma ","'}
        </p>
        <div className={classes.inputWrapper}>
          <TextField
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            aria-labelledby='resource-keywords'
            onFocus={() => setTranslationType('none')}
          />
          <ScreenReaderSpan id='resource-keywords' label='Nøkkelord' />
        </div>
        <h2 className={classes.subHeader}>Hvilken sektor er tjenesten relatert til?</h2>
        <p className={classes.text}>En tjeneste kan relateres til flere industrier/sektorer</p>
        {/* TODO - inform user that this is optional */}
        <div className={classes.inputWrapper}>
          <Select
            multiple
            options={resourceSectorsMockOptions}
            onChange={(e) => setSector(e)}
            value={sector}
            label='Hvilken sektor er tjenesten relatert til?'
            hideLabel
            onFocus={() => setTranslationType('none')}
          />
        </div>
        <h2 className={classes.subHeader}>Hvilket tematiske område dekker tjenesten?</h2>
        <p className={classes.text}>En tjeneste kan relateres til et tematisk område</p>
        <div className={classes.inputWrapper}>
          <Select
            options={resourceThematicAreaMockOptions}
            onChange={(e: string) => setThematicArea(e)}
            value={thematicArea}
            label='Velg tematisk område'
            hideLabel
            onFocus={() => setTranslationType('none')}
          />
        </div>
        <h2 className={classes.subHeader}>Delegasjonstekst</h2>
        <p className={classes.text}></p>
        <div className={classes.inputWrapper}>
          <TextField
            value={rightDescription['nb']}
            onChange={(e) => setRightDescription({ ...rightDescription, nb: e.target.value })}
            aria-labelledby='resource-delegationtext'
            onFocus={() => setTranslationType('rightDescription')}
          />
          <ScreenReaderSpan id='resource-delegationtext' label='Delegasjonstekst' />
        </div>
        <h2 className={classes.subHeader}>Vis i offentlige kataloger</h2>
        <p className={classes.text}>
          Etter publisering blir ressursen tilgjengelig i kataloger, blant annet i altinn, på
          norge.no og data.norge.no.
        </p>
        <div className={classes.inputWrapper}>
          <Switch isChecked={isPublicService} onToggle={(b: boolean) => setIsPublicService(b)} />
          <p
            className={isPublicService ? classes.toggleTextActive : classes.toggleTextInactive}
          >{`Ressursen ${isPublicService ? 'skal' : 'skal ikke'} vises i offentlige kataloger.`}</p>
        </div>
        <div className={classes.buttonWrapper}>
          {/* TODO - Find out if this button should be here, and if a success message should be shown */}
          <Button onClick={handleSaveResource}>Lagre ressurs</Button>
        </div>
      </>
    );
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.pageWrapper}>{displayContent()}</div>
      {translationType !== 'none' && displayRightTranslationBar()}
    </div>
  );
};
