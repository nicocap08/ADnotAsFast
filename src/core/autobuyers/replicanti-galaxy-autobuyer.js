import { AutobuyerState } from "./autobuyer";

export class ReplicantiGalaxyAutobuyerState extends AutobuyerState {
  get data() {
    return player.auto.replicantiGalaxies;
  }

  get name() {
    return `Replicanti Galaxy`;
  }

  get isUnlocked() {
    return EternityMilestone.autobuyerReplicantiGalaxy.isReached;
  }

  get isEnabled() {
    return Achievement(138).isUnlocked || !TimeStudy(131).isBought || this.data.isForceEnabled;
  }

  get hasUnlimitedBulk() {
    return Achievement(126).isUnlocked;
  }
  get isForceEnabled() {
    if(this.data.isForceEnabled == undefined) this.data.isForceEnabled = false;
    return this.data.isForceEnabled;
  }
  set isForceEnabled(value) {
    this.data.isForceEnabled = value;
  }

  tick() {
    if (!this.isEnabled) return;
    replicantiGalaxy(true);
  }
}
