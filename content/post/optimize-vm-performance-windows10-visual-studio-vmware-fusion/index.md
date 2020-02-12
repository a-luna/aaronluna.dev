---
title: "How to Optimize Performance of Windows 10 and Visual Studio in VMWare Fusion"
slug: "optimize-vm-performance-windows10-visual-studio-vmware-fusion"
aliases:
    - /2018/01/26/optimize-om-performance-windows10-visual-studio-vmware-fusion/
    - /2018/01/26/optimize-vm-performance-windows10-visual-studio-vmware-fusion/
date: "2018-01-26"
menu_section: "blog"
categories: ["Virtualization"]
summary: "Packer is an open source tool for creating identical machine images for multiple platforms from a single source configuration. Packer is lightweight, runs on every major operating system, and is highly performant, creating machine images for multiple platforms in parallel. In this post, I will demonstrate how to create a packer template for AWS that automatically installs and configures NGINX on the most recent Ubuntu OS."
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Daniel Olah on Unsplash"
  - name: img1
    src: images/vmware_proc_memory.jpg
    title: Figure 1 - Processors & Memory Settings
  - name: img2
    src: images/vmware_hard_drive_scsi.jpg
    title: Figure 2 - Hard Disk Settings
  - name: img3
    src: images/textedit_preferences.jpg
    title: Figure 3 - TextEdit Preferences menu showing location of Smart quotes setting
  - name: img4
    src: images/vnware_window_menu.jpg
    title: Figure 4 - The virtual machine library can be accessed from the Window menu
  - name: img5
    src: images/vmware_edit_vmx_file.jpg
    title: Figure 5 - Menu options available with the ALT key pressed
  - name: img6
    src: images/windows_network_connection_details.jpg
    title: Figure 6 - Network adapter properties for E1000E and VMXNET3 within Windows
  - name: img7
    src: images/textedit_updated_config.jpg
    title: Figure 7 - .VMX file with additional settings added
  - name: img8
    src: images/disk_clean_up_default.jpg
    title: Figure 8 - Disk Cleanup Tool
  - name: img9
    src: images/disk_clean_up_windows_update.jpg
    title: Figure 9 - Disk Cleanup Tool with Windows Update Cleanup option selected
  - name: img10
    src: images/disk_clean_up_in_progress.jpg
    title: Figure 10 - Disk Cleanup in progress
  - name: img11
    src: images/windows_search_settings.jpg
    title: Figure 11 - Windows Settings Search Results
  - name: img12
    src: images/windows_virtual_memory_settings.jpg
    title: Figure 12 - Changes to paging file size within Performance Options
---

The majority of my work consists of C#/.NET development, and Visual Studio+ReSharper is my preferred IDE. Since I'm a Mac user, I run VS on a Windows 10 instance with VMWare Fusion. For the first month or so everything ran smoothly. However, the performance of the VM degraded significantly over time, especially with multiple Visual Studio projects open in the VM and resource-hungry programs running on the Mac simultaneously.

Thankfully, after changing a few settings and clearing unnecessary files I was able to improve the speed and responsiveness of both my Mac and the Windows 10 instance. I've documented these steps below to help others who find themselves in a similar situation.

## Settings in VMWare Fusion

 I found that a combination of 2 processor cores with 4096 MB of memory works best for my needs (Note: My MacBook Pro has a 2.8GHz Intel quad core i7 with 8 GB RAM and Intel Iris GPU with 1536 MB). Also, select "Enable hypervisor applications in this virtual machine" as shown in **Figure 1**.

{{< linked_image img1 >}}

I also saw a performance boost by changing the driver for the hard drive bus type to SCSI. On the Hard Disk Settings page, expand the "Advanced options" menu and change the Bus type to SCSI. Also, select "Pre-allocate disk space" as shown in **Figure 2**:

{{< linked_image img2 >}}

## Settings in the .VMX File

VMWare only exposes a small number of settings through the UI. There are hundreds of additional configuration options which can only be modified by editing the .vmx file.

{{< alert_box >}}
You should always make a backup of the .vmx file before modifying it. You can easily make changes that render the VM unusable or unable to boot!
{{< /alert_box >}}

Before changing the .vmx file itself, launch TextEdit and open the Preferences menu. **Make sure Smart quotes is unchecked** (See **Figure 3** below). If this option is checked and you save the .vmx file, you will not be able to boot your VM.

{{< linked_image img3 >}}

The easiest way to access the .vmx file is from the list of virtual machines in the main VMWare Fusion window. If the list of virtual machines is not visible, go to **Window -&#62; Virtual Machine Library**.

{{< linked_image img4 >}}

Next, shutdown the VM. Ensure that it is completely shutdown and not in a suspended state.

Right click on the VM as shown in **Figure 5**. If you press and hold the &#8997; (ALT) key, **Show in Finder** will change to **Open Config File in Editor**.

{{< linked_image img5 >}}

There are other hidden options within this menu, try holding the ^ (CTRL) key or &#8984; (CMD) key  and the menu item will change to **Show Config File in Finder** and **Open Latest Log File**, respectively.

Right-click on your VM while holding the &#8997; (ALT) key and select **Open Config File in Editor**. This will launch TextEdit. Make the following changes to the .vmx file:
<ul>
  <li>
    <p>Find <strong>ethernet0.virtualDev = “e1000e”</strong> and change it to <strong>ethernet0.virtualDev = “vmxnet3”</strong>.</p>
    <p><strong>E1000E</strong> is the default value and is recognized by Windows as an Intel 82574L Gigabit NIC. <strong>VMXNET3</strong> is a virtual NIC which is optimized for use in a VM and is not based on a physical part (<strong>Figure 6</strong> shows how the two NICs are displayed in Windows) Changing this value should drastically improve network performance. If you would like to read a detailed comparison of these two NICs and others which can be used with VMWare, <a href="https://kb.vmware.com/s/article/1001805">check out this page</a>.</p>
{{< linked_image img6 >}}
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
{{< linked_image img7 >}}
  </li>
</ul>

## Windows Update Cleanup

One of the main causes of slower performance in my Windows VM turned out to be caused by Windows Update. I noticed that I was constantly running out of hard drive space, and would allocate more space from the host OS to improve performance. It turns out that Windows keeps copies of all updates, and performing a normal Disk Cleanup does not remove these files even when they are completely redundant.

{{< linked_image img8 >}}

The Disk Cleanup tool is located at <strong>Control Panel -&#62; System and Security -&#62; Administrative Tools</strong>. Note that in <strong>Figure 8</strong>, performing the cleanup will free up less than 10 MB. You need to click the <strong>"Clean up system files"</strong>  button and select the checkbox for <strong>"Windows Update Cleanup"</strong> as shown in <strong>Figure 9</strong>:

{{< linked_image img9 >}}

Now, the Disk Cleanup tool shows that 3 GB of space will be reclaimed. Running this tool once a month should improve the performance of your Windows 10 VM dramatically. The cleanup process took approximately 45 minutes to complete when I ran it for the first time.

{{< linked_image img10 >}}

## Virtual Memory Settings in Windows 10

Another way to realize performance gains is by adjusting the size of the paging file.  Right-click the Start button and select "Settings". Enter "performance" in the search box and select "Adjust the appearance and performance of Windows" as shown in <strong>Figure 11</strong>:

{{< linked_image img11 >}}

This will open Performance Options. Navigate to the Advanced tab and click the Change… button. Uncheck the "Automatically manage paging file size for all drives" checkbox and select the radio button for "Custom Size". For both Initial and Maximum Size enter twice the amount of RAM that the VM has allocated. For my setup, this equals 2 * 4096 MB = 8192 MB. See <strong>Figure 12</strong>:

{{< linked_image img12 >}}

Click the Set button and reboot the VM in order to apply the changes.

## Remove AppData Folders

If Visual Studio is still sluggish, you may be experiencing [the issue described in this blog post](http://www.geocortex.com/about/blog/archive/slow-visual-studio-performance-solved/). Using the extremely useful [Process Monitor](https://docs.microsoft.com/en-us/sysinternals/downloads/procmon) (the link in the blog post is broken and outdated), the author found that Visual Studio was accessing the location <strong>C:\Users\...\AppData\Local\Microsoft\WebSiteCache</strong> on nearly every IDE operation. The author zipped the folder contents and moved them elsewhere, but it appears from the comments that the files are not needed. Moving/deleting the contents of this directory completely fixed the sluggishness in Visual Studio.

Here is a link to [Sysinternals Suite](https://docs.microsoft.com/en-us/sysinternals/downloads/sysinternals-suite) which is a collection of free troubleshooting utilties from Microsoft (Process Monitor is part of the suite). Again, I am linking this because the link in the original blog post is broken and outdated.
