import type { PolicySubject } from '../../src/types';

export const mockSubjectId1: string = 's1';
export const mockSubjectId2: string = 's2';
export const mockSubjectId3: string = 's3';

export const mockSubjectTitle1: string = 'Subject 1';
export const mockSubjectTitle2: string = 'Subject 2';
export const mockSubjectTitle3: string = 'Subject 3';

export const mockSubject1: PolicySubject = {
  subjectId: mockSubjectId1,
  subjectSource: 'Subject1',
  subjectTitle: mockSubjectTitle1,
  subjectDescription: '',
};
export const mockSubject2: PolicySubject = {
  subjectId: mockSubjectId2,
  subjectSource: 'Subject2',
  subjectTitle: mockSubjectTitle2,
  subjectDescription: '',
};
export const mockSubject3: PolicySubject = {
  subjectId: mockSubjectId3,
  subjectSource: 'Subject3',
  subjectTitle: mockSubjectTitle3,
  subjectDescription: '',
};
export const mockSubjects: PolicySubject[] = [mockSubject1, mockSubject2, mockSubject3];

export const mockSubjectBackendString1: string = `urn:${mockSubject1.subjectSource}:${mockSubject1.subjectId}`;
export const mockSubjectBackendString3: string = `urn:${mockSubject3.subjectSource}:${mockSubject3.subjectId}`;
