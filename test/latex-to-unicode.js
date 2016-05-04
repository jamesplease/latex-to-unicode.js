var expect = require('chai').expect;
var latexToUnicode = require('../index.js');

describe('latex-to-unicode', function() {

  describe('aliases', function () {
    it('should convert `\\mathbb{}` like if it was `\\bb{}`', function () {
      var latex = '\\mathbb{mathBB}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('𝕞𝕒𝕥𝕙𝔹𝔹');
    });
  });

  describe('symbols', function() {
    it('should correctly convert `\\alpha` symbol', function() {
      var latex = '\\alpha';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('α');
    });

    it('should not confuse `\\ggg` with `\\gg`', function() {
      var latex = '\\ggg';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('⋙');
    });

    it('should being able to convert multiple symbols', function() {
      var latex = '\\alpha * x + \\beta * y = \\gamma';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('α * x + β * y = γ');
    });

    it('should being able to convert same symbol multiple times', function() {
      var latex = '\\alpha + \\alpha = 2 * \\alpha';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('α + α = 2 * α');
    });

    it('should convert symbols even if their are touching each others', function() {
      var latex = '\\alpha\\beta\\gamma';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('αβγ');
    });
  });

  describe('modifiers', function() {
    it('should being able to apply modifiers on single element', function() {
      var latex = '\\bbB';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('𝔹');
    });

    it('should being able to apply modifiers on group of elements', function() {
      var latex = '\\bb{BCD}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('𝔹ℂ𝔻');
    });

    it('should use char if modified char does not exist', function() {
      var latex = '\\frak@';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('@');
    });

    it('should being able to apply multiple modifiers', function() {
      var latex = '\\it{IT} and \\bf{bf}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('𝐼𝑇 and 𝐛𝐟');
    });

    it('should being able to apply same modifier multiple times', function() {
      var latex = '\\it{IT} and \\it{it}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('𝐼𝑇 and 𝑖𝑡');
    });

    it('should correctly apply sup modifiers', function() {
      var latex = 'a^2 + b^2 = c^2';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('a² + b² = c²');
    });

    it('should being able to apply sub modifiers', function() {
      var latex = 'u_3 > u_2 > u_1';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('u₃ > u₂ > u₁');
    });
  });

  describe('fractions', function() {
    it('should convert simple fractions to unicode', function() {
      var latex = '\\frac{1}{2}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('½');
    });

    it('should fall back to conventional notation for complicated fractions', function() {
      var latex = '\\frac{15}{100}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('(15 / 100)');
    });

    it('should accept others LaTeX symbols', function() {
      var latex = '\\frac{\\pi}{3}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('(π / 3)');
    });

    it('should correctly convert nested fractions', function() {
      var latex = '\\frac{\\frac{1}{2}}{\\frac{3}{4}}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('(½ / ¾)');
    });
  });

  describe('roots', function() {
    it('should convert simple roots to unicode', function() {
      var latex = '\\sqrt[3]{2}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('∛(2)');
    });

    it('should fall back to sup notation for complicated roots', function() {
      var latex = '\\sqrt[15]{100}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('¹⁵√(100)');
    });

    it('should fall back to default square root if degree parameter is omitted', function() {
      var latex = '\\sqrt{100}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('√(100)');
    });

    it('should accept others LaTeX symbols', function() {
      var latex = '\\sqrt{\\pi}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('√(π)');
    });

    it('should correctly convert nested square roots', function() {
      var latex = '\\sqrt{\\sqrt[3]{4}}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('√(∛(4))');
    });
  });

  describe('binoms', function() {
    it('should convert simple binoms using conventional notation', function() {
      var latex = '\\binom{1}{2}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('(1 ¦ 2)');
    });

    it('should accept others LaTeX symbols', function() {
      var latex = '\\binom{\\pi}{3}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('(π ¦ 3)');
    });

    it('should correctly convert nested binoms', function() {
      var latex = '\\binom{\\binom{1}{2}}{\\binom{3}{4}}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('((1 ¦ 2) ¦ (3 ¦ 4))');
    });
  });

  describe('accents', function() {
    it('should being able to apply accent on single element', function() {
      var latex = '\\tilde{a}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('ã');
    });

    it('should being able to apply accent on group of elements', function() {
      var latex = '\\mathring{BCD}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('BC̊D');
    });
  });

  describe('convert', function() {
    it('should correctly convert quadratic formula', function() {
      var latex = '\\itx = \\frac{-\\itb \\pm \\sqrt{\\itb^2 - \\it{4ac}}}{\\it{2a}}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('𝑥 = ((-𝑏 ± √(𝑏² - 4𝑎𝑐)) / (2𝑎))');
    });

    it('should correctly convert Newton binomial formulae', function() {
      var latex = '(x + y)^n = \\sum(\\binom{n}{k} * (x^{n-k}y^k))';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('(x + y)ⁿ = ∑((n ¦ k) * (xⁿ⁻ᵏyᵏ))');
    });

    it('should correctly convert Euler formulae', function() {
      var latex = '\\mathbf{e}^{ix} = cos(x) + \\it{i} sin(x)';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('𝐞ⁱˣ = cos(x) + 𝑖 sin(x)');
    });

    it('should correctly convert gravitation formulae', function() {
      var latex = '\\vec{F}_{12} = -\\monoG \\centerdot \\frac{\\itm_1\\itm_2}{\\it{d}^2} \\vec{u}_{12}';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('F⃗₁₂ = -𝙶 ⋅ ((𝑚₁𝑚₂) / (𝑑²)) u⃗₁₂');
    });

    it('should correctly convert closed path integral', function() {
      var latex = '\\oint ! \\nabla f \, \\mathbf{d}t = 0';
      var unicode = latexToUnicode(latex);
      expect(unicode).to.equal('∮ ! ∇ f , 𝐝t = 0');
    });
  });
});

