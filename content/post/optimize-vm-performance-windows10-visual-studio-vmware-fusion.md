---
title: "How to Optimize Performance of Windows 10 and Visual Studio in VMWare Fusion"
slug: "optimize-vm-performance-windows10-visual-studio-vmware-fusion"
aliases:
    - /2018/01/26/optimize-om-performance-windows10-visual-studio-vmware-fusion/
    - /2018/01/26/optimize-vm-performance-windows10-visual-studio-vmware-fusion/
date: "2018-01-26"
categories: ["Virtualization"]
---

The majority of my work consists of C#/.NET development, and Visual Studio+ReSharper is my preferred IDE. Since I'm a Mac user, I run VS on a Windows 10 instance with VMWare Fusion. For the first month or so everything ran smoothly. However, the performance of the VM degraded significantly over time, especially with multiple Visual Studio projects open in the VM and resource-hungry programs running on the Mac simultaneously.

Thankfully, after changing a few settings and clearing unnecessary files I was able to improve the speed and responsiveness of both my Mac and the Windows 10 instance. I've documented these steps below to help others who find themselves in a similar situation.

## Settings in VMWare Fusion

 I found that a combination of 2 processor cores with 4096 MB of memory works best for my needs (Note: My MacBook Pro has a 2.8GHz Intel quad core i7 with 8 GB RAM and Intel Iris GPU with 1536 MB). Also, select "Enable hypervisor applications in this virtual machine" as shown in **Figure 1**.

 {{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/vmware_proc_memory.jpeg" width="500" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/vmware_proc_memory.jpeg" alt="VMWare Fusion Processor and Memory Settings" caption="Figure 1 - Processors &#38; Memory Settings">}}

I also saw a performance boost by changing the driver for the hard drive bus type to SCSI. On the Hard Disk Settings page, expand the "Advanced options" menu and change the Bus type to SCSI. Also, select "Pre-allocate disk space" as shown in **Figure 2**:

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/vnware_hard_drive_scsi.jpeg" width="550" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/vnware_hard_drive_scsi.jpeg" alt="VMWare Fusion Hard Disk Settings" caption="Figure 2 - Hard Disk Settings">}}

## Settings in the .VMX File

VMWare only exposes a small number of settings through the UI. There are hundreds of additional configuration options which can only be modified by editing the .vmx file.

<div class="alert alert-flex">
  <div class="alert-icon">
    <i class="fa fa-exclamation-triangle"></i>
  </div>
  <div class="alert-message">
    <p>You should always make a backup of the .vmx file before modifying it. You can easily make changes that render the VM unusable or unable to boot!</p>
  </div>
</div>

Before changing the .vmx file itself, launch TextEdit and open the Preferences menu. **Make sure Smart quotes is unchecked** (See **Figure 3** below). If this option is checked and you save the .vmx file, you will not be able to boot your VM.

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/textedit_preferences.jpeg" width="400" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/textedit_preferences.jpeg" alt="TextEdit Preferences menu showing location of Smart quotes setting" caption="Figure 3 - TextEdit Preferences menu showing location of Smart quotes setting">}}

The easiest way to access the .vmx file is from the list of virtual machines in the main VMWare Fusion window. If the list of virtual machines is not visible, go to **Window -&#62; Virtual Machine Library**.

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/vnware_window_menu.jpeg" width="400" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/vnware_window_menu.jpeg" alt="VMWare virtual machine library can be accessed from the Window menu" caption="Figure 4 - The virtual machine library can be accessed from the Window menu">}}

Next, shutdown the VM. Ensure that it is completely shutdown and not in a suspended state.

Right click on the VM as shown in **Figure 5**. If you press and hold the &#8997; (ALT) key, **Show in Finder** will change to **Open Config File in Editor**.

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/vmware_edit_vmx_file.jpeg" width="300" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/vmware_edit_vmx_file.jpeg" alt="VMWare Menu options available with the ALT key pressed" caption="Figure 5 - Menu options available with the ALT key pressed">}}

There are other hidden options within this menu, try holding the ^ (CTRL) key or &#8984; (CMD) key  and the menu item will change to **Show Config File in Finder** and **Open Latest Log File**, respectively.

Right-click on your VM while holding the &#8997; (ALT) key and select **Open Config File in Editor**. This will launch TextEdit. Make the following changes to the .vmx file:
<ul>
  <li>
    <p>Find <strong>ethernet0.virtualDev = “e1000e”</strong> and change it to <strong>ethernet0.virtualDev = “vmxnet3”</strong>.</p>
    <p><strong>E1000E</strong> is the default value and is recognized by Windows as an Intel 82574L Gigabit NIC. <strong>VMXNET3</strong> is a virtual NIC which is optimized for use in a VM and is not based on a physical part (<strong>Figure 6</strong> shows how the two NICs are displayed in Windows) Changing this value should drastically improve network performance. If you would like to read a detailed comparison of these two NICs and others which can be used with VMWare, <a href="https://kb.vmware.com/s/article/1001805">check out this page</a>.</p>
    {{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/windows_network_connection_details.jpeg" width="700" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/windows_network_connection_details.jpeg" alt="Network adapter properties for E1000E and VMXNET3" caption="Figure 6 - Network adapter properties for E1000E and VMXNET3 within Windows">}}
  </li>
  <li>
    <p>Add the following lines to the .vmx file:</p>
    <div class="table-wrapper">
      <div class="responsive">
        <table class="vmx-file-changes">
          <thead>
            <tr>
              <td colspan="2" class="table-number">Table 1</td>
            </tr>
            <tr>
              <td colspan="2" class="table-title">Configuration settings to add to .vmx file<sup>1</sup></td>
            </tr>
            <tr>
              <th class="first-column column-header">Add to .VMX File</th>
              <th class="last-column column-header">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="first-column">scsi0:0.virtualSSD = 1</td>
              <td class="last-column">Optimizes disk I/O for SSD. <strong>Only use this if your Mac has an SSD!</strong></td>
            </tr>
            <tr>
              <td class="first-column">prefvmx.useRecommendedLockedMemSize = “TRUE”</td>
              <td class="last-column">Speed up I/O at the cost of increased memory usage in the host OS</td>
            </tr>
            <tr>
              <td class="first-column">sched.mem.pshare.enable = “FALSE”</td>
              <td class="last-column">Disables page sharing</td>
            </tr>
            <tr>
              <td class="first-column last-row">MemAllowAutoScaleDown = “FALSE”</td>
              <td class="last-column last-row">Disables scale down of memory allocation</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" class="table-footer"><sup>1</sup>Source: <a href="http://artykul8.com/2012/06/vmware-performance-enhancing/">http://artykul8.com/2012/06/vmware-performance-enhancing/</a></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    {{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/textedit_updated_config.jpeg" width="500" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/textedit_updated_config.jpeg" alt="VMX file with additional settings added" caption="Figure 7 - .VMX file with additional settings added">}}
  </li>
</ul>

## Windows Update Cleanup

One of the main causes of slower performance in my Windows VM turned out to be caused by Windows Update. I noticed that I was constantly running out of hard drive space, and would allocate more space from the host OS to improve performance. It turns out that Windows keeps copies of all updates, and performing a normal Disk Cleanup does not remove these files even when they are completely redundant.

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/disk+clean+up+-+default.JPG" width="350" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/disk+clean+up+-+default.JPG" alt="Disk Cleanup Tool" caption="Figure 8 - Disk Cleanup Tool">}}

The Disk Cleanup tool is located at <strong>Control Panel -&#62; System and Security -&#62; Administrative Tools</strong>. Note that in <strong>Figure 8</strong>, performing the cleanup will free up less than 10 MB. You need to click the <strong>"Clean up system files"</strong>  button and select the checkbox for <strong>"Windows Update Cleanup"</strong> as shown in <strong>Figure 9</strong>:

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/disk+clean+up+-+windows+update.JPG" width="350" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/disk+clean+up+-+windows+update.JPG" alt="Disk Cleanup Tool with Windows Update Cleanup option selected" caption="Figure 9 - Disk Cleanup Tool with Windows Update Cleanup option selected">}}

Now, the Disk Cleanup tool shows that 3 GB of space will be reclaimed. Running this tool once a month should improve the performance of your Windows 10 VM dramatically. The cleanup process took approximately 45 minutes to complete when I ran it for the first time.

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/disk+clean+up+-+in+progress.JPG" width="300" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/disk+clean+up+-+in+progress.JPG" alt="Disk Cleanup in progress" caption="Figure 10 - Disk Cleanup in progress">}}

## Virtual Memory Settings in Windows 10

Another way to realize performance gains is by adjusting the size of the paging file.  Right-click the Start button and select "Settings". Enter "performance" in the search box and select "Adjust the appearance and performance of Windows" as shown in <strong>Figure 11</strong>:

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/windows_search_settings.jpeg" width="300" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/windows_search_settings.jpeg" alt="Search results for performance in Windows Settings" caption="Figure 11 - Windows Settings Search Results">}}

This will open Performance Options. Navigate to the Advanced tab and click the Change… button. Uncheck the "Automatically manage paging file size for all drives" checkbox and select the radio button for "Custom Size". For both Initial and Maximum Size enter twice the amount of RAM that the VM has allocated. For my setup, this equals 2 * 4096 MB = 8192 MB. See <strong>Figure 12</strong>:

{{<figure src="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/windows_virtual_memory_settings.jpeg" width="700" link="https://s3-us-west-1.amazonaws.com/alunapublic/optimize_vmware_fusion/windows_virtual_memory_settings.jpeg" alt="Changes to paging file size within Performance Options" caption="Figure 12 - Changes to paging file size within Performance Options">}}

Click the Set button and reboot the VM in order to apply the changes.

## Remove AppData Folders

If Visual Studio is still sluggish, you may be experiencing [the issue described in this blog post](http://www.geocortex.com/about/blog/archive/slow-visual-studio-performance-solved/). Using the extremely useful [Process Monitor](https://docs.microsoft.com/en-us/sysinternals/downloads/procmon) (the link in the blog post is broken and outdated), the author found that Visual Studio was accessing the location <strong>C:\Users\...\AppData\Local\Microsoft\WebSiteCache</strong> on nearly every IDE operation. The author zipped the folder contents and moved them elsewhere, but it appears from the comments that the files are not needed. Moving/deleting the contents of this directory completely fixed the sluggishness in Visual Studio.

Here is a link to [Sysinternals Suite](https://docs.microsoft.com/en-us/sysinternals/downloads/sysinternals-suite) which is a collection of free troubleshooting utilties from Microsoft (Process Monitor is part of the suite). Again, I am linking this because the link in the original blog post is broken and outdated.
