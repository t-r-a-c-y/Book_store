using my.bookshop from './schema';

annotate my.bookshop.Users with @PersonalData : {
    DataSubjectRole : 'Customer',
    EntitySemantics : 'DataSubject'
} {
    ID @PersonalData.FieldSemantics : 'DataSubjectID';
    name @PersonalData.IsPotentiallyPersonal;
    budget @PersonalData.IsPotentiallySensitive;
};