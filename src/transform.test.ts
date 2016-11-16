
import * as chai from 'chai';
import * as Transform from './transform';

const expect = chai.expect;

describe('Transform', () => {
    it('extract field should give the right value.', () => {
        const fnField = Transform.field('name');
        expect(fnField({name: 'First'})).to.be.equal('First');
        expect(fnField({age: 42})).to.be.undefined;
    });

    it('expects that the parent will give the right value.', () => {
        const json = {name: 'First'};
        const fnParent = Transform.field('name').parent();
        expect(fnParent(json)).to.be.equal(json);
    });
});

