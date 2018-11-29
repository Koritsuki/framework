import { Spec } from '@specron/spec';
import { GenericProvider } from '@0xcert/ethereum-generic-provider';
import { Protocol } from '@0xcert/ethereum-sandbox';
import { AssetLedger } from '../../../core/ledger';

interface Data {
  provider: GenericProvider;
  ledger: AssetLedger;
  protocol: Protocol;
  bob: string;
}

const spec = new Spec<Data>();

spec.before(async (stage) => {
  const protocol = new Protocol(stage.web3);
  stage.set('protocol', await protocol.deploy());
});

spec.before(async (stage) => {
  const provider = new GenericProvider({
    client: stage.web3,
    accountId: await stage.web3.eth.getCoinbase(),
  });

  stage.set('provider', provider);
});

spec.before(async (stage) => {
  const provider = stage.get('provider');
  const ledgerId = stage.get('protocol').xcert.instance.options.address;

  stage.set('ledger', new AssetLedger(provider, ledgerId));
});

spec.before(async (stage) => {
  const accounts = await stage.web3.eth.getAccounts();
  stage.set('bob', accounts[1]);
});

spec.test('create a new asset', async (ctx) => {
  const xcert = ctx.get('protocol').xcert;
  const ledger = ctx.get('ledger');
  const bob = ctx.get('bob');

  await ledger.createAsset({
    accountId: bob, 
    assetId: '1',
    proof: '0x973124ffc4a03e66d6a4458e587d5d6146f71fc57f359c8d516e0b12a50ab0d9'
  });
  const asset1Owner = await xcert.instance.methods.ownerOf('1').call();
  ctx.is(asset1Owner, bob);
});

export default spec;