
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

    it('expects that the parent still exists even though the field does not.', () => {
        const json = {name: 'First'};
        const fnParent = Transform.field('age').parent();
        expect(fnParent(json)).to.be.equal(json);
    });

    it('expects parent result to be undefined.', () => {
        const json = {name: 'First'};
        const fnParent = Transform.parent();
        expect(fnParent(json)).to.be.undefined;
    });

    it('expects parent result to be undefined.', () => {
        const json = {name: 'First'};
        const fnParent = Transform.field('name').parent().parent();
        expect(fnParent(json)).to.be.undefined;
    });

    it('extract field should give the right value.', () => {
        const json = { a: { b: { c: 'abc' }}, a1: { b: 'a1b'} };
        const fnField0 = Transform.field('a').field('b').field('c');
        const fnField1 = fnField0.parent().parent().parent().field('a1').field('b');
        expect(fnField0(json)).to.be.equal('abc');
        expect(fnField1(json)).to.be.equal('a1b');
    });

});

